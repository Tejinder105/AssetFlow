"use client"

import Image from "next/image"
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
import { loginSchema } from "@/features/auth/schema"
import type { LoginInput } from "@/features/auth/types"
import { useAuthStore } from "@/store/auth"

type LoginFieldErrors = Partial<Record<keyof LoginInput | "form", string>>

const initialValues: LoginInput = {
  email: "",
  password: "",
}

const zodFieldErrors = (error: ZodError<LoginInput>): LoginFieldErrors =>
  error.issues.reduce<LoginFieldErrors>((errors, issue) => {
    const field = issue.path[0] as keyof LoginInput | undefined
    if (field && !errors[field]) {
      errors[field] = issue.message
    }
    return errors
  }, {})

const apiFieldErrors = (error: ApiRequestError): LoginFieldErrors => {
  if (!error.errors.length) {
    return { form: error.message }
  }

  return error.errors.reduce<LoginFieldErrors>(
    (errors, issue) => {
      const field = issue.field as keyof LoginInput
      if (field === "email" || field === "password") {
        errors[field] = issue.message
      } else {
        errors.form = issue.message
      }
      return errors
    },
    { form: error.message }
  )
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const status = useAuthStore((state) => state.status)
  const [values, setValues] = useState<LoginInput>(initialValues)
  const [errors, setErrors] = useState<LoginFieldErrors>({})

  const isSubmitting = status === "loading"

  const updateField = (field: keyof LoginInput, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }))
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsed = loginSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error))
      return
    }

    try {
      await login(parsed.data)
      router.push("/dashboard")
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setErrors(apiFieldErrors(error))
        return
      }

      setErrors({
        form: error instanceof Error ? error.message : "Unable to log in",
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
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Sign in to manage AssetFlow inventory
                </p>
              </div>

              {errors.form && <FieldError>{errors.form}</FieldError>}

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

              <Field data-invalid={Boolean(errors.password)}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={values.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  required
                />
                <FieldError>{errors.password}</FieldError>
              </Field>

              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Don&apos;t have an account? <Link href="/signup">Sign up</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <Image
              src="/images/colorful-flow-background_52683-43164.avif"
              alt="AssetFlow background"
              fill
              priority
              sizes="50vw"
              className="object-cover dark:brightness-[0.5]"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Protected sessions use a short-lived access token and an HttpOnly refresh cookie.
      </FieldDescription>
    </div>
  )
}
