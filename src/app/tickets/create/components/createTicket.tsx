"use client";

import { useEffect, useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useCreateTicket from "../_hooks/useCreateTicket";
import { axiosInstance } from "@/lib/axios";

interface TicketFormValues {
  title: string;
  event: string;
  price: number;
  limit: number;
  description: string;
}

interface EventOption {
  id: number;
  title: string;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  event: Yup.string().required("Event is required"),
  price: Yup.number().required("Price is required").min(0, "Minimum is 0"),
  limit: Yup.number().required("Limit is required").min(1, "Minimum is 1"),
  description: Yup.string().required("Description is required"),
});

const CreateTicket = () => {
  const createTicket = useCreateTicket();
  const [submitting, setSubmitting] = useState(false);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axiosInstance.get("/events");
        setEvents(res.data.data); // assuming response has { data: Event[] }
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <main className="container mx-auto mt-10 px-4 pb-20">
      <h1 className="mb-6 text-3xl font-bold text-orange-500">Create Ticket</h1>

      <Formik<TicketFormValues>
        initialValues={{
          title: "",
          event: "",
          price: 0,
          limit: 1,
          description: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          setSubmitting(true);
          try {
            await createTicket.mutateAsync(values);
            resetForm();
          } catch (err) {
            console.error(err);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {() => (
          <Form className="space-y-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Left */}
              <div className="space-y-6">
                <div className="space-y-1">
                  <Label htmlFor="title">Title *</Label>
                  <Field name="title" as={Input} placeholder="Ticket title" />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="text-sm text-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="price">Price *</Label>
                  <Field
                    name="price"
                    type="number"
                    as={Input}
                    placeholder="Enter price"
                    min="0"
                  />
                  <ErrorMessage
                    name="price"
                    component="div"
                    className="text-sm text-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="limit">Limit *</Label>
                  <Field
                    name="limit"
                    type="number"
                    as={Input}
                    placeholder="Ticket limit"
                    min="1"
                  />
                  <ErrorMessage
                    name="limit"
                    component="div"
                    className="text-sm text-red-500"
                  />
                </div>
              </div>

              {/* Right */}
              <div className="space-y-6">
                <div className="space-y-1">
                  <Label htmlFor="event">Event *</Label>
                  <Field
                    as="select"
                    name="event"
                    className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="">Select event</option>
                    {loadingEvents ? (
                      <option disabled>Loading events...</option>
                    ) : (
                      events.map((event) => (
                        <option key={event.id} value={String(event.id)}>
                          {event.title}
                        </option>
                      ))
                    )}
                  </Field>
                  <ErrorMessage
                    name="event"
                    component="div"
                    className="text-sm text-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description">Description *</Label>
                  <Field
                    name="description"
                    as="textarea"
                    rows={6}
                    placeholder="Ticket description..."
                    className="border-input bg-background w-full resize-none rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-sm text-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                {submitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </main>
  );
};

export default CreateTicket;