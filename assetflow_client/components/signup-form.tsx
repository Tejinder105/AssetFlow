"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ZodError } from "zod"

import { cn } from "@/lib/utils"
import { ApiRequestError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { registerSchema } from "@/features/auth/schema"
import type { RegisterInput } from "@/features/auth/types"
import { useAuthStore } from "@/store/auth"

type SignupFieldErrors = Partial<Record<keyof RegisterInput | "form", string>>

const initialValues: RegisterInput = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
}

const zodFieldErrors = (error: ZodError<RegisterInput>): SignupFieldErrors =>
  error.issues.reduce<SignupFieldErrors>((errors, issue) => {
    const field = issue.path[0] as keyof RegisterInput | undefined
    if (field && !errors[field]) {
      errors[field] = issue.message
    }
    return errors
  }, {})

const apiFieldErrors = (error: ApiRequestError): SignupFieldErrors => {
  if (!error.errors.length) {
    return { form: error.message }
  }

  return error.errors.reduce<SignupFieldErrors>(
    (errors, issue) => {
      const field = issue.field as keyof RegisterInput
      if (["name", "email", "password", "confirmPassword"].includes(field)) {
        errors[field] = issue.message
      } else {
        errors.form = issue.message
      }
      return errors
    },
    { form: error.message }
  )
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const register = useAuthStore((state) => state.register)
  const status = useAuthStore((state) => state.status)
  const [values, setValues] = useState<RegisterInput>(initialValues)
  const [errors, setErrors] = useState<SignupFieldErrors>({})

  const isSubmitting = status === "loading"

  const updateField = (field: keyof RegisterInput, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }))
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsed = registerSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error))
      return
    }

    try {
      await register(parsed.data)
      router.push("/login")
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setErrors(apiFieldErrors(error))
        return
      }

      setErrors({
        form: error instanceof Error ? error.message : "Unable to create account",
      })
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={onSubmit} noValidate>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  Join AssetFlow with an employee account
                </p>
              </div>

              {errors.form && <FieldError>{errors.form}</FieldError>}

              <Field data-invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  value={values.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  required
                />
                <FieldError>{errors.name}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.email)}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="m@example.com"
                  value={values.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  required
                />
                <FieldError>{errors.email}</FieldError>
              </Field>

              <Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field data-invalid={Boolean(errors.password)}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      value={values.password}
                      onChange={(event) => updateField("password", event.target.value)}
                      required
                    />
                    <FieldError>{errors.password}</FieldError>
                  </Field>
                  <Field data-invalid={Boolean(errors.confirmPassword)}>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={values.confirmPassword}
                      onChange={(event) =>
                        updateField("confirmPassword", event.target.value)
                      }
                      required
                    />
                    <FieldError>{errors.confirmPassword}</FieldError>
                  </Field>
                </div>
                <FieldDescription>
                  Passwords need uppercase, lowercase, and a number.
                </FieldDescription>
              </Field>

              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Account"}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Already have an account? <Link href="/login">Sign in</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholder.svg"
              alt="AssetFlow inventory"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        New users are created with the Employee role by the backend.
      </FieldDescription>
    </div>
  )
}
