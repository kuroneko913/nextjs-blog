"use client";

import { useState } from "react";
import type { Note } from "@/src/notes/model";
import DiscardableNote from "./DiscardableNote";
import DiscardNotice from "./DiscardNotice";
import useOwner from "./useOwner";

export default function NoteDetail({ note }: { note: Note }) {
  const owner = useOwner();
  const [discarded, setDiscarded] = useState(false);
  return discarded ? <DiscardNotice note={note} onRestore={() => setDiscarded(false)} /> :
    <DiscardableNote note={note} owner={owner} onDiscard={() => setDiscarded(true)} />;
}
