"use client";

import { useEffect, useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useCreateRoom from "../_hooks/useCreateRoom";
import { axiosInstance } from "@/lib/axios";
import { useSession } from "next-auth/react";

interface RoomFormValues {
  name: string;
  capacity: number;
  price: number;
  description: string;
  property: string; // Changed from propertyId to property (slug)
  limit: number;
}

interface PropertyOption {
  id: string | number;
  title: string;
  slug: string; // Added slug field
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Room name is required"),
  capacity: Yup.number()
    .required("Capacity is required")
    .min(1, "Minimum is 1"),
  price: Yup.number().required("Price is required").min(0, "Minimum is 0"),
  description: Yup.string().required("Description is required"),
  property: Yup.string().required("Property is required"), // Changed from propertyId to property
  limit: Yup.number().required("Limit is required").min(1, "Minimum is 1"),
});

const CreateRoom = () => {
  const createRoom = useCreateRoom();
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Fetch only user's properties by adding auth header
        const res = await axiosInstance.get("/property", {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        });
        // Make sure we're getting the data structure correctly
        const propertiesData = res.data.data ?? res.data;
        setProperties(Array.isArray(propertiesData) ? propertiesData : []);
      } catch (error) {
        console.error("Failed to fetch properties", error);
        setProperties([]); // Set empty array on error
      } finally {
        setLoadingProperties(false);
      }
    };

    if (session?.user.accessToken) {
      fetchProperties();
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">
              Create <span className="text-orange-500">Room</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Fill in the details to create your new room
            </p>
          </div>

          <Formik<RoomFormValues>
            initialValues={{
              name: "",
              capacity: 1,
              price: 0,
              description: "",
              property: "", // Changed from propertyId to property
              limit: 1,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { resetForm }) => {
              setSubmitting(true);
              try {
                await createRoom.mutateAsync(values);
                resetForm();
              } catch (err) {
                console.error("Error creating room:", err);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {() => (
              <Form className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left Column */}
                  <div className="space-y-8">
                    {/* Room Name */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="name"
                        className="text-white font-medium text-base"
                      >
                        Room Name *
                      </Label>
                      <Field
                        name="name"
                        as={Input}
                        placeholder="Enter room name"
                        className="h-12 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-sm text-red-400"
                      />
                    </div>

                    {/* Capacity */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="capacity"
                        className="text-white font-medium text-base"
                      >
                        Capacity *
                      </Label>
                      <Field
                        name="capacity"
                        type="number"
                        as={Input}
                        placeholder="Enter capacity"
                        min="1"
                        className="h-12 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg"
                      />
                      <ErrorMessage
                        name="capacity"
                        component="div"
                        className="text-sm text-red-400"
                      />
                    </div>

                    {/* Price */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="price"
                        className="text-white font-medium text-base"
                      >
                        Price (per night) *
                      </Label>
                      <Field
                        name="price"
                        type="number"
                        as={Input}
                        placeholder="Enter price"
                        min="0"
                        className="h-12 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg"
                      />
                      <ErrorMessage
                        name="price"
                        component="div"
                        className="text-sm text-red-400"
                      />
                    </div>

                    {/* Stock Limit */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="limit"
                        className="text-white font-medium text-base"
                      >
                        Stock Limit *
                      </Label>
                      <Field
                        name="limit"
                        type="number"
                        as={Input}
                        placeholder="Enter stock limit"
                        min="1"
                        className="h-12 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg"
                      />
                      <ErrorMessage
                        name="limit"
                        component="div"
                        className="text-sm text-red-400"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-8">
                    {/* Property Selection */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="property"
                        className="text-white font-medium text-base"
                      >
                        Property *
                      </Label>
                      <Field
                        as="select"
                        name="property"
                        className="h-12 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 appearance-none"
                      >
                        <option value="" className="bg-gray-900">
                          {loadingProperties
                            ? "Loading properties..."
                            : "Select property"}
                        </option>
                        {!loadingProperties && properties.length === 0 && (
                          <option disabled className="bg-gray-900">
                            No properties found
                          </option>
                        )}
                        {properties.map((property) => (
                          <option
                            key={property.id}
                            value={String(property.id)}
                            className="bg-gray-900"
                          >
                            {property.title}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="property"
                        component="div"
                        className="text-sm text-red-400"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="description"
                        className="text-white font-medium text-base"
                      >
                        Room Description *
                      </Label>
                      <Field
                        name="description"
                        as="textarea"
                        rows={8}
                        placeholder="Describe your room..."
                        className="w-full resize-none rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                      <ErrorMessage
                        name="description"
                        component="div"
                        className="text-sm text-red-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-8 border-t border-gray-700">
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="px-8 py-3 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      Save as Draft
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || loadingProperties}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Room...
                        </>
                      ) : (
                        "Create Room"
                      )}
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </main>
    </div>
  );
};

export default CreateRoom;
