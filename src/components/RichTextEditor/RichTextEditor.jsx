import { useEffect, useRef, useState } from "react";
import { sanitizeRichText } from "../../utils/richText.js";

const controls = [
  { label: "P", command: "formatBlock", value: "P", title: "Parágrafo" },
  { label: "H2", command: "formatBlock", value: "H2", title: "Título" },
  { label: "H3", command: "formatBlock", value: "H3", title: "Subtítulo" },
  { label: "B", command: "bold", title: "Negrito" },
  { label: "I", command: "italic", title: "Itálico" },
  { label: "U", command: "underline", title: "Sublinhado" },
  { label: "•", command: "insertUnorderedList", title: "Lista" },
  { label: "1.", command: "insertOrderedList", title: "Lista numerada" },
];

export default function RichTextEditor({ id, name, value = "", onChange, onImageUpload, required }) {
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);
  const savedRangeRef = useRef(null);
  const selectedImageRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [hasSelectedImage, setHasSelectedImage] = useState(false);

  useEffect(() => {
    if (!editorRef.current || editorRef.current.innerHTML === value) return;
    if (document.activeElement === editorRef.current) return;
    editorRef.current.innerHTML = value || "";
  }, [value]);

  function emitChange() {
    onChange(editorRef.current?.innerHTML || "");
  }

  function runCommand(command, commandValue = null) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  }

  function saveCursorPosition() {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (editorRef.current?.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }

  function clearImageSelection() {
    selectedImageRef.current?.classList.remove("is-selected");
    selectedImageRef.current = null;
    setHasSelectedImage(false);
  }

  function selectImage(image) {
    clearImageSelection();
    image.classList.add("is-selected");
    selectedImageRef.current = image;
    setHasSelectedImage(true);
  }

  function deleteSelectedImage() {
    if (!selectedImageRef.current) return;
    selectedImageRef.current.remove();
    selectedImageRef.current = null;
    setHasSelectedImage(false);
    emitChange();
    editorRef.current?.focus();
  }

  function requestImage() {
    saveCursorPosition();
    imageInputRef.current?.click();
  }

  async function handleImageFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !onImageUpload) return;

    setIsUploadingImage(true);
    try {
      const imageUrl = await onImageUpload(file);
      if (!imageUrl) return;

      const alt = window.prompt("Texto alternativo da imagem", file.name.replace(/\.[^.]+$/, "")) || "";
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = alt.trim();
      image.loading = "lazy";

      const editor = editorRef.current;
      editor?.focus();
      const range = savedRangeRef.current;

      if (range && editor?.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        range.insertNode(image);
        range.setStartAfter(image);
        range.collapse(true);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editor?.append(image);
      }

      selectImage(image);
      emitChange();
    } finally {
      setIsUploadingImage(false);
    }
  }

  function handleEditorClick(event) {
    if (event.target instanceof HTMLImageElement) {
      selectImage(event.target);
      return;
    }
    clearImageSelection();
  }

  function handleEditorKeyDown(event) {
    if (hasSelectedImage && (event.key === "Delete" || event.key === "Backspace")) {
      event.preventDefault();
      deleteSelectedImage();
    }
  }

  function insertLink() {
    const url = window.prompt("URL do link");
    if (!url) return;

    runCommand("createLink", url);
  }

  function handlePaste(event) {
    event.preventDefault();
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");

    if (html) {
      document.execCommand("insertHTML", false, sanitizeRichText(html));
    } else {
      document.execCommand("insertText", false, text);
    }

    emitChange();
  }

  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar" aria-label="Ferramentas de formatação">
        {controls.map((control) => (
          <button
            key={`${control.command}-${control.value || ""}`}
            type="button"
            title={control.title}
            onClick={() => runCommand(control.command, control.value)}
          >
            {control.label}
          </button>
        ))}
        <button type="button" title="Link" onClick={insertLink}>
          Link
        </button>
        {onImageUpload && (
          <>
            <button type="button" title="Inserir imagem na posição do cursor" onClick={requestImage} disabled={isUploadingImage}>
              {isUploadingImage ? "Enviando..." : "Imagem"}
            </button>
            <button type="button" title="Excluir imagem selecionada" onClick={deleteSelectedImage} disabled={!hasSelectedImage}>
              Excluir imagem
            </button>
            <input ref={imageInputRef} className="rich-editor-image-input" type="file" accept="image/*" onChange={handleImageFile} />
          </>
        )}
      </div>
      <div
        aria-label={name}
        className="rich-editor-surface"
        contentEditable
        id={id}
        onClick={handleEditorClick}
        onInput={emitChange}
        onKeyDown={handleEditorKeyDown}
        onKeyUp={saveCursorPosition}
        onMouseUp={saveCursorPosition}
        onPaste={handlePaste}
        ref={editorRef}
        role="textbox"
        tabIndex={0}
      />
      <input name={name} required={required} type="hidden" value={value || ""} />
    </div>
  );
}
