export default function VerifyRequest() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="flex flex-col items-center space-y-8 text-center max-w-md px-4">
        <h1 className="text-4xl font-bold">Check your email</h1>
        <p className="text-xl text-gray-600">
          A sign in link has been sent to your email address. Please check your
          inbox (and spam folder) for the authentication link.
        </p>
        <div className="text-sm text-gray-500">
          If you don't receive the email within a few minutes, try requesting a
          new link.
        </div>
      </div>
    </div>
  );
}
