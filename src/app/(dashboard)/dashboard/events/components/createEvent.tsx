"use client";

import TiptapRichtextEditor from "@/components/TipTapRichtextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Trash } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import * as Yup from "yup";
import useCreateEvent from "../create/_hooks/useCreateEvent";

interface FormValues {
  title: string;
  category: string;
  description: string;
  thumbnail: File | null;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  category: Yup.string().required("Category is required"),
  description: Yup.string().required("Description is required"),
  thumbnail: Yup.mixed().required("Thumbnail is required"),
});

const CreateEvent = () => {
  const [previewImage, setPreviewImage] = useState<string>("");
  const { mutateAsync: createEvent, isPending } = useCreateEvent();

  const handleThumbnailChange = (
    e: ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setFieldValue("thumbnail", file);
    }
  };

  const handleRemoveThumbnail = (
    setFieldValue: (field: string, value: any) => void,
  ) => {
    setPreviewImage("");
    setFieldValue("thumbnail", null);
  };

  return (
    <main className="container mx-auto mt-10 px-4 pb-20">
      <h1 className="mb-6 text-3xl font-bold text-orange-500">Create Event</h1>

      <Formik<FormValues>
        initialValues={{
          title: "",
          category: "",
          description: "",
          thumbnail: null,

        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          
          await createEvent({
            title: values.title,
            category: values.category,
            description: values.description,
            thumbnail: values.thumbnail,
          });
        }}
      >
        {({ setFieldValue, values }) => (
          <Form className="space-y-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Left Section */}
              <div className="space-y-6">
                <div className="space-y-1">
                  <Label htmlFor="title">Title *</Label>
                  <Field name="title" as={Input} placeholder="Event title" />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="text-sm text-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="category">Category *</Label>
                  <Field
                    as="select"
                    name="category"
                    className="w-full rounded-md border px-3 py-2"
                  >
                    <option value="">Select category</option>
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="team">Team</option>
                  </Field>
                  <ErrorMessage
                    name="category"
                    component="div"
                    className="text-sm text-red-500"
                  />
                </div>
              </div>

              {/* Right Section */}
              <div className="space-y-6">
                <div className="space-y-1">
                  <Label htmlFor="thumbnail">Thumbnail *</Label>
                  {previewImage ? (
                    <div className="relative w-fit">
                      <Image
                        src={previewImage}
                        alt="Thumbnail preview"
                        width={300}
                        height={200}
                        className="rounded-md object-cover shadow-md"
                      />
                      <Button
                        size="icon"
                        type="button"
                        className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white shadow"
                        onClick={() => handleRemoveThumbnail(setFieldValue)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Input
                        type="file"
                        name="thumbnail"
                        accept="image/*"
                        onChange={(e) =>
                          handleThumbnailChange(e, setFieldValue)
                        }
                      />
                      <ErrorMessage
                        name="thumbnail"
                        component="div"
                        className="text-sm text-red-500"
                      />
                    </>
                  )}
                </div>

                <div className="space-y-1">
                  <TiptapRichtextEditor
                    name="description"
                    label="Description *"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-sm text-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                {isPending ? "Submitting..." : "Submit Event"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </main>
  );
};

export default CreateEvent;