import { Editor } from "@tiptap/react";
import { Bold, Heading1, Heading2, Heading3, Italic } from "lucide-react";
import { FC } from "react";
import { Toggle } from "./ui/toggle";

interface TiptapMenuBarProps {
  editor: Editor | null;
}

const TiptapMenuBar: FC<TiptapMenuBarProps> = ({ editor }) => {
  if (!editor) return null;

  const options = [
    {
      icon: <Heading1 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      pressed: editor.isActive("heading", { level: 1 }), // Fixed: was "preesed"
    },
    {
      icon: <Heading2 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      pressed: editor.isActive("heading", { level: 2 }), // Fixed: was "preesed"
    },
    {
      icon: <Heading3 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      pressed: editor.isActive("heading", { level: 3 }), // Fixed: was "preesed"
    },
    {
      icon: <Bold className="size-4" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      pressed: editor.isActive("bold"), // Fixed: was "preesed"
    },
    {
      icon: <Italic className="size-4" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      pressed: editor.isActive("italic"), // Fixed: was "preesed"
    },
  ];

  return (
    <div className="my-2 border rounded-md p-1 space-x-2">
      {options.map((option, index) => (
        <Toggle
          key={index}
          pressed={option.pressed} // This was receiving undefined due to typo
          onPressedChange={option.onClick}
        >
          {option.icon}
        </Toggle>
      ))}
    </div>
  );
};

export default TiptapMenuBar;