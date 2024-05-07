---
title: Laravel Validatorの実装を追ってみたよ。
date: 2021-08-15T13:04:50.113Z
description: Laravel Validatorのコードを読みました。
---
## そもそも

PHPのWebFrameworkであるLaravelには、様々な便利な機能がある。
[FormRequest](https://readouble.com/laravel/6.x/ja/validation.html)もそのひとつである。
これを用いることで、フォームから送信された値にvalidationをかけることができる。
rules()にバリデーションルールを、messages()にどんなバリデーションエラーメッセージを表示するかを指定することができる。

```php
	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules()
	{
		return [
			'contact_form_name' => ['required', 'string:255'],
			'contact_form_email' => ['required', 'email:rfc'],
			'contact_form_phone_number' => ['nullable', 'digits_between:10,11'],
			'contact_form_options' => ['required'],
			'contact_form_inquire_content' => ['required'],
			'g-recaptcha-response' => ['required','captcha'],
		];
	}

	/**
	 * Validate Message
	 * @return array
	 */
	public function messages(){
		return [
			'contact_form_name.required' => '名前を入力してください',
			'contact_form_name.string' => '255文字以内で入力してください',
			'contact_form_email.required' => 'メールアドレスを入力してください',
			'contact_form_phone_number.digits_between' => '10桁もしくは11桁で入力してください',
			'contact_form_options.required' => '問い合わせ項目を入力してください',
			'contact_form_inquire_content.required' => '問い合わせ内容を入力してください',
			'g-recaptcha-response.required' => 'チェックしてください',
		];
	}
```

そんなLaravelのFormRequestを用いたバリデーションで、アップロードファイルのバリデーションも行うことができる。たとえば、以下のようにすることで、ファイルをアップロードを2MB(2048KB)までに限定することができるはずである。

```php
'form_file' => ['nullable', 'file', 'max:2048']
```

ところが、2MB以上のファイルをアップロードしてもバリデーションエラーになってくれなかった...
文法的にはまちがってないんだけどな...

Laravelのissueでバグ報告がないか調べると、1件だけ類似の報告があった。が、取り合ってもらえてない。

https://github.com/laravel/framework/issues/37933

バグの可能性も残りつつ、とりあえずコードを読んでみよう！ということで、Validator周りのコードを読むことになった。

## Laravel Code Reading!!!

まず、FormRequestに定義したバリデーションルールがどのように読み込まれ、どのように実行されているのかを追うことにする。
バリデーション済みの値を取得するのは、validated()というメソッドである。ここからみていこう。

vendor/laravel/framework/src/Illuminate/Foundation/Http/FormRequest.php

```php
/**
     * Get the validated data from the request.
     *
     * @return array
     */
    public function validated()
    {
        return $this->validator->validated();
    }

```

この
```$this->validator```
は、
```
vendor/laravel/framework/src/Illuminate/Contracts/Validation/Validator.php
```
で定義されているinterface Validator class を想定している。
これの実装は、
```
vendor/laravel/framework/src/Illuminate/Validation/Validator.php
```
である。実装されたvalidated()を確認すると...


```php

    /**
     * Get the attributes and values that were validated.
     *
     * @return array
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function validated()
    {
        if ($this->invalid()) {
            throw new ValidationException($this);
        }

        $results = [];

        $missingValue = Str::random(10);

        foreach (array_keys($this->getRules()) as $key) {
            $value = data_get($this->getData(), $key, $missingValue);
            if ($value !== $missingValue) {
                Arr::set($results, $key, $value);
            }
        }

        return $results;
    }

```

この$this->getRules()の中にはちゃんとFormRequestを継承して作ったRequestファイルに定義されたルールが確認できた。(ddで確認したら本当にruleが入っている連想配列だった)

$valueも同様にvar_dump()で値を確認したところ、少なくとも一時的なファイル名を表す記号列を確認できたのでここまでは多分大丈夫。

いや、ここではvalidate()が呼ばれてない、だと... ? Arr::setもdata_getもデータの形かえてるだけじゃん...

もしや、$this->invalid() お主か？

```php

/**
     * Returns the data which was invalid.
     *
     * @return array
     */
    public function invalid()
    {
        if (! $this->messages) {
            $this->passes();
        }

        $invalid = array_intersect_key(
            $this->data, $this->attributesThatHaveMessages()
        );

        $result = [];

        $failed = Arr::only(Arr::dot($invalid), array_keys($this->failed()));

        foreach ($failed as $key => $failure) {
            Arr::set($result, $key, $failure);
        }

        return $result;
    }
```

$this->passes()それっぽいのいるぞ！


```php
/**
     * Determine if the data passes the validation rules.
     *
     * @return bool
     */
    public function passes()
    {
        $this->messages = new MessageBag;

        [$this->distinctValues, $this->failedRules] = [[], []];

        // We'll spin through each rule, validating the attributes attached to that
        // rule. Any error messages will be added to the containers with each of
        // the other error messages, returning true if we don't have messages.
        foreach ($this->rules as $attribute => $rules) {
            if ($this->shouldBeExcluded($attribute)) {
                $this->removeAttribute($attribute);

                continue;
            }

            foreach ($rules as $rule) {
                $this->validateAttribute($attribute, $rule);

                if ($this->shouldBeExcluded($attribute)) {
                    $this->removeAttribute($attribute);

                    break;
                }

                if ($this->shouldStopValidating($attribute)) {
                    break;
                }
            }
        }

        // Here we will spin through all of the "after" hooks on this validator and
        // fire them off. This gives the callbacks a chance to perform all kinds
        // of other validation that needs to get wrapped up in this operation.
        foreach ($this->after as $after) {
            $after();
        }

        return $this->messages->isEmpty();
    }
```

念のため、$ruleをvar_dumpしてみると、以下のように設定したバリデーションルールが得られた。

```php
string(4) "file" string(8) "max:2048" string(9) "mimes:pdf"
```

ここら辺はよくわからないので、var_dump()を仕掛けるだけ仕掛けて、デバッグだ。

validateAttribute がvalidationを実行しているっぽいぞ。

```php
/**
     * Validate a given attribute against a rule.
     *
     * @param  string  $attribute
     * @param  string  $rule
     * @return void
     */
    protected function validateAttribute($attribute, $rule)
    {
        $this->currentRule = $rule;

        [$rule, $parameters] = ValidationRuleParser::parse($rule);

        if ($rule == '') {
            return;
        }

        // First we will get the correct keys for the given attribute in case the field is nested in
        // an array. Then we determine if the given rule accepts other field names as parameters.
        // If so, we will replace any asterisks found in the parameters with the correct keys.
        if (($keys = $this->getExplicitKeys($attribute)) &&
            $this->dependsOnOtherFields($rule)) {
            $parameters = $this->replaceAsterisksInParameters($parameters, $keys);
        }

        $value = $this->getValue($attribute);

        // If the attribute is a file, we will verify that the file upload was actually successful
        // and if it wasn't we will add a failure for the attribute. Files may not successfully
        // upload if they are too large based on PHP's settings so we will bail in this case.
        if ($value instanceof UploadedFile && ! $value->isValid() &&
            $this->hasRule($attribute, array_merge($this->fileRules, $this->implicitRules))
        ) {
            return $this->addFailure($attribute, 'uploaded', []);
        }

        // If we have made it this far we will make sure the attribute is validatable and if it is
        // we will call the validation method with the attribute. If a method returns false the
        // attribute is invalid and we will add a failure message for this failing attribute.
        $validatable = $this->isValidatable($rule, $attribute, $value);

        if ($rule instanceof RuleContract) {
            return $validatable
                    ? $this->validateUsingCustomRule($attribute, $value, $rule)
                    : null;
        }

        $method = "validate{$rule}";

        if ($validatable && ! $this->$method($attribute, $value, $parameters, $this)) {
            $this->addFailure($attribute, $rule, $parameters);
        }
    }
```

ファイルアップロードに失敗したらここで弾かれるようだ。ここは通っている。

```php
// If the attribute is a file, we will verify that the file upload was actually successful
        // and if it wasn't we will add a failure for the attribute. Files may not successfully
        // upload if they are too large based on PHP's settings so we will bail in this case.
        if ($value instanceof UploadedFile && ! $value->isValid() &&
            $this->hasRule($attribute, array_merge($this->fileRules, $this->implicitRules))
        ) {
            return $this->addFailure($attribute, 'uploaded', []);
        }
```

```php
/**
     * Returns whether the file was uploaded successfully.
     *
     * @return bool True if the file has been uploaded with HTTP and no error occurred
     */
    public function isValid()
    {
        $isOk = \UPLOAD_ERR_OK === $this->error;

        return $this->test ? $isOk : $isOk && is_uploaded_file($this->getPathname());
    }
```

$methodをvar_dumpしたら呼び出されるvalidationメソッド名が得られた。ここではファイルサイズのバリデーションを疑っているので、validatedMaxを見に行くことにしよう。

```php
string(4) "file" string(12) "validateFile" 
string(8) "max:2048" string(11) "validateMax" 
string(9) "mimes:pdf" string(13) "validateMimes"
```

```php
"max:2048" string(3) "Max" bool(false) bool(true) bool(true) bool(true) "
```

なんだと、ここではvalidation していないだと？

他のフォームで文字数制限をmaxで指定している部分は、確かにここでvalidateMaxを呼び出している。

Validator最初で読み込んでいた。traitだから、ValidatorにvalidateMax()があるかのように振る舞えるんだな。

```php
use Concerns\FormatsMessages,
        Concerns\ValidatesAttributes;
```

[トレイトについて](https://laraweb.net/surrounding/1631/)

vendor/laravel/framework/src/Illuminate/Validation/Concerns/ValidatesAttributes.php 1176~

ここで、var_dump($attribute);を行い、validateMax()がファイルアップロード時に呼ばれていないことを確認した。

```php
/**
     * Validate the size of an attribute is less than a maximum value.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @param  array  $parameters
     * @return bool
     */
    public function validateMax($attribute, $value, $parameters)
    {
        $this->requireParameterCount(1, $parameters, 'max');

        if ($value instanceof UploadedFile && ! $value->isValid()) {
            return false;
        }
        return $this->getSize($attribute, $value) <= $parameters[0];
    }
```

throw new Exceptionすると、どこで何が呼ばれているのか追えてありがたいw

ここまでの状況をまとめると...
validateAttributeのvalidatableがFalseなので、validateMaxが呼ばれていないみたい。

validatableがなぜFalseなのかを確認する。
validatePresentに渡されるファイルの値がnullになっていた。

presentOrRuleIsImplicit($rule, $attribute, $value)

$valueの取得に失敗してそう。

form-file, form_file の違いで、正しく値を取得できていなかっただけだった。

バグを疑ってごめんなさい、Laravelさん...


## まとめ

LaravelのFormRequestでアップロードファイルサイズのバリデーションが動かない... ということで、
コードを読んだ結果、formにつけているname名とこのFormRequestに定義しているname名が一致していないことが原因だった... この程度のミスで一体どれだけ時間を溶かしたんだ... 

