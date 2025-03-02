"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import Checklist from "@editorjs/checklist";
import Quote from "@editorjs/quote";
import Image from "@editorjs/simple-image";

// Define custom type declarations for Editor.js plugins that are missing type definitions
declare module "@editorjs/checklist" {}
declare module "@editorjs/simple-image" {}

// Define the type for the route parameters
interface DocumentParams {
  id: string;
  locale: string;
}

export default async function DocumentPage({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const editorRef = useRef<EditorJS | null>(null);
  const editorInstanceRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("Untitled Document");

  useEffect(() => {
    // Skip initialization during SSR
    if (typeof window === "undefined") return;

    // Initialize Editor.js if it hasn't been initialized
    if (!editorRef.current && editorInstanceRef.current) {
      initEditor();
    }

    // Load document data if we have an ID
    if (id && id !== "new") {
      loadDocument();
    } else {
      setIsLoading(false);
    }

    // Cleanup function to destroy editor when unmounting
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [id]);

  const initEditor = () => {
    // Type assertion to bypass type checking for Editor.js tools
    const editorTools = {
      header: {
        class: Header,
        inlineToolbar: ["link"],
      },
      list: {
        class: List,
        inlineToolbar: true,
      },
      paragraph: {
        class: Paragraph,
        inlineToolbar: true,
      },
      checklist: {
        class: Checklist,
        inlineToolbar: true,
      },
      quote: {
        class: Quote,
        inlineToolbar: true,
      },
      image: {
        class: Image,
      },
    };

    const editor = new EditorJS({
      holder: editorInstanceRef.current!,
      tools: editorTools as any,
      autofocus: true,
      placeholder: "Start writing your document...",
      onChange: () => {
        // Auto-save functionality could be added here
      },
    });

    editorRef.current = editor;
  };

  const loadDocument = async () => {
    setIsLoading(true);
    try {
      // Replace with your actual API call to fetch document data
      const response = await fetch(`/api/documents/${id}`);
      const data = await response.json();

      if (data && data.title) {
        setDocumentTitle(data.title);
      }

      // Initialize the editor with the loaded data
      if (editorRef.current && data.content) {
        await editorRef.current.isReady;
        editorRef.current.render(data.content);
      }
    } catch (error) {
      console.error("Failed to load document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDocument = async () => {
    if (!editorRef.current) return;

    setIsSaving(true);
    try {
      const savedData = await editorRef.current.save();

      // Replace with your actual API call to save document data
      await fetch(`/api/documents/${id || "new"}`, {
        method: id && id !== "new" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: documentTitle,
          content: savedData,
        }),
      });

      // If this was a new document, redirect to the new document path
      if (!id || id === "new") {
        // Replace with your actual redirect logic
        // router.push(`/dashboard/documents/document/${newDocId}`);
      }
    } catch (error) {
      console.error("Failed to save document:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          value={documentTitle}
          onChange={(e) => setDocumentTitle(e.target.value)}
          className="text-3xl font-bold outline-none border-b-2 border-transparent focus:border-blue-500 w-full mr-4"
          placeholder="Document Title"
        />
        <button
          onClick={saveDocument}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading document...</p>
        </div>
      ) : (
        <div className="prose max-w-none">
          <div
            ref={editorInstanceRef}
            className="min-h-[500px] border rounded p-4"
          />
        </div>
      )}
    </div>
  );
}
