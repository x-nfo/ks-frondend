import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  async prerender() {
    // Halaman statis yang tidak butuh data dinamis
    // Akan di-generate jadi HTML statis saat build → tidak kena Workers
    return [
      "/about",
      "/contact",
      "/faq",
      "/returns",
      "/shipping",
      "/community",
      "/highlights",
      "/size-guide",
      "/terms",
      "/privacy",
    ];
  },
} satisfies Config;
