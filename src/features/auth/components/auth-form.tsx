"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEventHandler, type FormEventHandler } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";

type AuthFormProps = {
  mode: AuthMode;
};

type AuthFormValues = {
  email: string;
  password: string;
};

const initialValues: AuthFormValues = {
  email: "",
  password: "",
};

const copyByMode = {
  "sign-in": {
    alternateHref: "/sign-up",
    alternateLabel: "Create an account",
    description: "Sign in to keep your private Luna data tied to your account.",
    submitLabel: "Sign in",
    title: "Welcome back",
  },
  "sign-up": {
    alternateHref: "/sign-in",
    alternateLabel: "Already have an account?",
    description: "Create a private Luna account with email and password.",
    submitLabel: "Create account",
    title: "Create your account",
  },
} as const;

function validate(values: AuthFormValues) {
  if (!values.email.trim()) {
    return "Enter your email address.";
  }

  if (!values.email.includes("@")) {
    return "Enter a valid email address.";
  }

  if (!values.password.trim()) {
    return "Enter your password.";
  }

  if (values.password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  return null;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [values, setValues] = useState(initialValues);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const copy = copyByMode[mode];

  const handleEmailChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValues((current) => ({ ...current, email: event.target.value }));
  };

  const handlePasswordChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValues((current) => ({ ...current, password: event.target.value }));
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    const validationMessage = validate(values);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email.trim(),
          password: values.password,
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        router.replace("/onboarding");
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.session) {
        router.replace("/onboarding");
        router.refresh();
        return;
      }

      setInfoMessage("Account created. Check your email to confirm your account, then sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8 sm:px-6">
      <section
        className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_18px_60px_rgba(160,73,98,0.12)] backdrop-blur"
        data-testid={`auth-${mode}-card`}
      >
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent-strong/70">
            Luna
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{copy.title}</h1>
          <p className="mt-3 text-sm leading-6 text-foreground/68">{copy.description}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
          data-testid={`auth-${mode}-form`}
        >
          <label className="block" htmlFor={`${mode}-email`}>
            <span className="mb-2 block text-sm font-semibold">Email</span>
            <input
              id={`${mode}-email`}
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleEmailChange}
              className="w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
              data-testid={`auth-${mode}-email`}
            />
          </label>

          <label className="block" htmlFor={`${mode}-password`}>
            <span className="mb-2 block text-sm font-semibold">Password</span>
            <input
              id={`${mode}-password`}
              name="password"
              type="password"
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              value={values.password}
              onChange={handlePasswordChange}
              className="w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
              data-testid={`auth-${mode}-password`}
            />
          </label>

          {errorMessage ? (
            <p
              className="rounded-2xl border border-accent/20 bg-accent-soft/60 px-4 py-3 text-sm text-accent-strong"
              data-testid={`auth-${mode}-error`}
            >
              {errorMessage}
            </p>
          ) : null}

          {infoMessage ? (
            <p
              className="rounded-2xl border border-line bg-surface-muted px-4 py-3 text-sm text-foreground/70"
              data-testid={`auth-${mode}-info`}
            >
              {infoMessage}
            </p>
          ) : null}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(169,52,86,0.22)] transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
              data-testid={`auth-${mode}-submit`}
            >
              {isSubmitting ? "Please wait..." : copy.submitLabel}
            </button>
            <Link
              href={copy.alternateHref}
              className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold transition hover:bg-surface-muted"
              data-testid={`auth-${mode}-alternate`}
            >
              {copy.alternateLabel}
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
