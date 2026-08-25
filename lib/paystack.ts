export function loadPaystack(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("No window"));
      return;
    }

    if (window.PaystackPop) {
      resolve();
      return;
    }

    const src = "https://js.paystack.co/v1/inline.js";
    let script = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    }

    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      if (window.PaystackPop) {
        clearInterval(id);
        resolve();
      } else if (tries > 50) {
        clearInterval(id);
        reject(new Error("Paystack failed to load"));
      }
    }, 100);
  });
}

export function getPaystackKey() {
  const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY missing");
  return key;
}