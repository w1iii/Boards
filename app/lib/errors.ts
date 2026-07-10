import { NextResponse } from "next/server"

export class AppError extends Error {
  constructor(
    message: string,
    public status: number = 400,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    )
  }

  console.error("Unhandled error:", error)
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 },
  )
}
