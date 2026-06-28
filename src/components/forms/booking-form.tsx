"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import formsConfig from "@/config/forms.json";
import { bookingSchema, type BookingFormValues } from "@/lib/forms/booking-schema";

export function BookingForm() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema) as never,
    defaultValues: { trap: "" },
  });

  // Слушаем событие от календаря
  useEffect(() => {
    function onDateSelected(e: Event) {
      const iso = (e as CustomEvent<string>).detail;
      setValue("eventDate", iso, { shouldValidate: false });
    }
    window.addEventListener("kenderi:dateSelected", onDateSelected);
    return () => window.removeEventListener("kenderi:dateSelected", onDateSelected);
  }, [setValue]);

  const onSubmit = async (values: BookingFormValues) => {
    setServerError(null);
    setSent(false);

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      setServerError("Не удалось отправить заявку, попробуйте ещё раз.");
      return;
    }

    reset();
    setSent(true);
  };

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
      <input {...register("name")} placeholder={formsConfig.fields.name} className="field" />

      <div>
        <input
          {...register("phone")}
          placeholder={`${formsConfig.fields.phone} *`}
          className="field"
        />
        {errors.phone && <p className="mt-1.5 text-sm text-red-600">{errors.phone.message}</p>}
      </div>

      <input
        {...register("eventDate")}
        placeholder={formsConfig.fields.eventDate}
        className="field"
      />

      <input
        {...register("guestCount")}
        placeholder="Кол-во гостей (до 50)"
        className="field"
        type="number"
        min={1}
        max={50}
      />

      <textarea
        {...register("message")}
        placeholder="Комментарий / пожелания"
        rows={3}
        className="field sm:col-span-2"
      />

      <input
        {...register("trap")}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="sm:col-span-2">
        <button className="btn btn-gold w-full sm:w-auto" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Отправляем..." : formsConfig.cta.book}
        </button>
        <p className="mt-3 text-xs text-ink-muted">
          Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
        </p>
      </div>

      {sent && (
        <p className="sm:col-span-2 rounded-xl bg-brand/5 px-4 py-3 text-sm font-medium text-brand">
          Заявка отправлена! Мы свяжемся с вами в ближайшее время.
        </p>
      )}
      {serverError && (
        <p className="sm:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </p>
      )}
    </form>
  );
}
