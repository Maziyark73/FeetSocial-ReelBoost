"use client";
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const useApiPost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<unknown>(null);
  const router = useRouter();

  const postData = async (
    url: string,
    bodyData: unknown,
    contentType = "application/json"
  ) => {
    const token = Cookies.get("Reelboost_auth_token");

    try {
      setLoading(true);
      setError(null);

      const headers = {
        "Content-Type": contentType,
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + url,
        bodyData,
        { headers }
      );

      // ✅ Check for JSON response
      const contentTypeResponse = response.headers["content-type"] || "";
      if (!contentTypeResponse.includes("application/json")) {
        // Redirect silently
        router.replace("/not-found");
        return;
      }

      setData(response.data);
      return response.data;
    } catch (err: any) {
      const contentTypeError = err?.response?.headers?.["content-type"] || "";

      // ✅ Redirect if not JSON
      if (!contentTypeError.includes("application/json")) {
        router.replace("/not-found");
        return;
      }

      // ✅ Redirect on Unauthorized (401)
      if (err?.response?.status === 401) {
        Cookies.remove("Reelboost_auth_token");
        router.replace("/");
        return;
      }

      // ✅ Other error handling
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error("An unknown error occurred."));
      }

      // Re-throw if you want calling components to handle it
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, data, postData };
};

export default useApiPost;
   