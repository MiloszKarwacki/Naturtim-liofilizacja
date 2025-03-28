"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/auth/hooks/useAuth";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const { login, loading } = useAuth();
  const [credentials, setCredentials] = useState({
    login: "",
    password: ""
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await login(credentials.login, credentials.password);
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <h1 className="text-2xl font-semibold text-center">Panel logowania</h1>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login">Login</Label>
            <Input
              id="login"
              type="text"
              placeholder="Wprowadź login"
              value={credentials.login}
              onChange={e =>
                setCredentials(prev => ({ ...prev, login: e.target.value }))}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              placeholder="Wprowadź hasło"
              value={credentials.password}
              onChange={e =>
                setCredentials(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
              disabled={loading}
              required
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logowanie..." : "Zaloguj się"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
