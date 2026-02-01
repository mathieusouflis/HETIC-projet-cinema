import React from "react";

export const LoginForm = () => {
  const { login } = useAuthContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    await login({
      email: form.get("email"),
      password: form.get("password"),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" placeholder="email" />
      <input name="password" type="password" />
      <button type="submit">Login</button>
    </form>
  );
};