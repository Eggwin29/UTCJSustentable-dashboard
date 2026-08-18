import { useState } from "react";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/auth/useAuth";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await authService.signIn(email, password);
    } catch (error) {
      console.error(error);
      setErrorMessage("Correo o contraseña incorrectos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold">
          Iniciar sesión
        </h1>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-1"
          >
            Correo
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-1"
          >
            Contraseña
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        {errorMessage && (
          <p className="text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-slate-900 text-white px-4 py-2 disabled:opacity-50"
        >
          {isSubmitting
            ? "Iniciando sesión..."
            : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}