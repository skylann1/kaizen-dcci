"use client";

import React, { useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css"; // Import styles

// Dynamically import ReactQuill so it doesn't run on the server (SSR)
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false, loading: () => <div className="h-64 w-full bg-gray-50 animate-pulse rounded-2xl border border-gray-200"></div> });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const quillRef = useRef<any>(null);

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const { url } = await res.json();
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, "image", url);
          quill.setSelection(range.index + 1);
        } else {
          alert("Gagal mengupload gambar.");
        }
      } catch (error) {
        console.error("Upload failed", error);
      }
    };
  };

  // Modules configuration for ReactQuill
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image'],
        [{ 'align': [] }],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'indent',
    'link', 'image',
    'align'
  ];

  return (
    <div className="rich-text-editor-wrapper">
      <ReactQuill 
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Tuliskan konten berita di sini..."}
        className="bg-white rounded-2xl overflow-hidden border border-gray-200"
      />
    </div>
  );
}
