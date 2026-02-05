import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
declare global {
  interface Window {
    Razorpay: any;
  }
}

const API_URL = import.meta.env.VITE_API_URL;
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

const Payment = () => {
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [razorpayReady, setRazorpayReady] = useState(false);

  // Load Razorpay
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => setRazorpayReady(true);
    script.onerror = () =>
      setError("Failed to load payment system. Please refresh.");

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);


  // Check access
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/access/subjects?user_id=${userId}`
        );
        const data = await res.json();

        if (data.allowed) {
          navigate("/subjects", { replace: true });
          return;
        }
      } catch {
        setError("Failed to verify payment status");
      } finally {
        setChecking(false);
      }
    };

    checkPaymentStatus();
  }, [navigate]);

  // Handle payment
  const handlePayment = async () => {
    if (!razorpayReady) {
      setError("Payment system is still loading. Please wait.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderRes = await fetch(`${API_URL}/payments/create-order`, {
        method: "POST",
      });
      const order = await orderRes.json();

      const razorpay = new (window as any).Razorpay({
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Elyaitra",
        description: "Unlock Full Learning Access",

        handler: async (response: any) => {
          await fetch(`${API_URL}/payments/record`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: Number(localStorage.getItem("user_id")),
              amount: 1,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          navigate("/subjects", { replace: true });
        },
      });

      razorpay.open();
    } catch {
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Checking access…
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center px-4 py-12">
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent blur-[120px]" />

      <div className="relative z-10 w-full max-w-md glass-dark rounded-3xl p-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <span className="text-sm font-medium text-primary">
            One-Time Unlock
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-white mb-2">
          Unlock Full Access
        </h1>

        <p className="text-muted-foreground mb-6">
          Get unlimited access to all subjects, AI explanations, and exam-focused
          answers.
        </p>

        {/* Price */}
        <div className="mb-6">
          <span className="text-5xl font-extrabold text-white">₹1</span>
          <p className="text-sm text-muted-foreground mt-1">
            Pay once • Lifetime access
          </p>
        </div>

        {/* Benefits */}
        <ul className="space-y-3 text-sm text-muted-foreground mb-6 text-left">
          <li className="flex gap-2">
            <span className="text-primary">✓</span> AI-powered explanations
          </li>
          <li className="flex gap-2">
            <span className="text-primary">✓</span> Exam-oriented answers
          </li>
          <li className="flex gap-2">
            <span className="text-primary">✓</span> All core subjects unlocked
          </li>
          <li className="flex gap-2">
            <span className="text-primary">✓</span> No subscriptions, no renewals
          </li>
        </ul>

        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        {/* CTA */}
        <button
          onClick={handlePayment}
          disabled={loading || !razorpayReady}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg transition hover:brightness-110 disabled:opacity-60"
        >
          {loading
            ? "Processing payment…"
            : razorpayReady
            ? "Pay & Unlock Access"
            : "Loading payment…"}
        </button>

        <p className="mt-4 text-xs text-muted-foreground">
          Secure payments powered by Razorpay
        </p>
      </div>
    </div>
  );
};

export default Payment;
