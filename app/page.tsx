import Link from "next/link";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function Home() {
  return (
    <main
      className={`${poppins.variable} min-h-screen bg-[#FAF9F5] font-[family-name:var(--font-poppins)] text-[#2C4A30]`}
    >
      {/* ================= NAVBAR ================= */}
      <header className="border-b border-[#EAE6DA]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5C8A54] text-base">
              ♻️
            </div>

            <span className="text-base font-semibold tracking-tight text-[#2C4A30]">
              Bank Sampah
            </span>
          </Link>

          {/* NAVIGATION */}
          <nav className="hidden items-center gap-10 md:flex">
            <a
              href="#tentang"
              className="text-sm font-normal text-[#6B7268] transition hover:text-[#2C4A30]"
            >
              Tentang
            </a>

            <a
              href="#fitur"
              className="text-sm font-normal text-[#6B7268] transition hover:text-[#2C4A30]"
            >
              Fitur
            </a>

            <a
              href="#cara-kerja"
              className="text-sm font-normal text-[#6B7268] transition hover:text-[#2C4A30]"
            >
              Cara Kerja
            </a>
          </nav>

          {/* POJOK KANAN DIKOSONGKAN */}
          <div className="w-[88px]" />
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center lg:px-8 lg:py-32">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#5C8A54]">
          Bersama Menjaga Lingkungan
        </p>

        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-[1.2] tracking-tight text-[#2C4A30] sm:text-5xl">
          Sampah jadi lebih berharga
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base font-light leading-7 text-[#6B7268]">
          Kelola sampah dengan lebih mudah, dapatkan manfaatnya, dan ikut
          menciptakan lingkungan yang lebih bersih melalui Bank Sampah
          Digital Hub.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/nasabah-login"
            className="rounded-full bg-[#2C4A30] px-8 py-3.5 text-sm font-medium text-white transition hover:bg-[#486F43]"
          >
            Login Nasabah
          </Link>

          <Link
            href="/admin-login"
            className="rounded-full border border-[#D9D3C3] px-8 py-3.5 text-sm font-medium text-[#2C4A30] transition hover:bg-[#F2EFE6]"
          >
            Login Admin
          </Link>
        </div>

        {/* MINI STATS */}
        <div className="mx-auto mt-20 grid max-w-2xl grid-cols-3 gap-6 border-t border-[#EAE6DA] pt-10">
          <div>
            <p className="text-2xl font-semibold text-[#2C4A30]">
              100%
            </p>

            <p className="mt-1 text-xs font-light text-[#8A9086]">
              Digital
            </p>
          </div>

          <div className="border-x border-[#EAE6DA]">
            <p className="text-2xl font-semibold text-[#2C4A30]">
              ♻️
            </p>

            <p className="mt-1 text-xs font-light text-[#8A9086]">
              Ramah Lingkungan
            </p>
          </div>

          <div>
            <p className="text-2xl font-semibold text-[#2C4A30]">
              Mudah
            </p>

            <p className="mt-1 text-xs font-light text-[#8A9086]">
              Digunakan
            </p>
          </div>
        </div>
      </section>

      {/* ================= TENTANG ================= */}
      <section
        id="tentang"
        className="border-t border-[#EAE6DA] bg-white"
      >
        <div className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#5C8A54]">
            Tentang Kami
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#2C4A30]">
            Mengubah kebiasaan, menjaga lingkungan
          </h2>

          <p className="mt-5 text-base font-light leading-7 text-[#6B7268]">
            Bank Sampah Digital Hub membantu nasabah dan pengelola bank
            sampah mengelola aktivitas persampahan secara lebih mudah dan
            terorganisir.
          </p>
        </div>
      </section>

      {/* ================= FITUR ================= */}
      <section
        id="fitur"
        className="mx-auto max-w-6xl px-6 py-24 lg:px-8"
      >
        <div className="mb-14 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#5C8A54]">
            Fitur
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#2C4A30]">
            Semua lebih mudah dalam satu tempat
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-[#EAE6DA] bg-[#EAE6DA] md:grid-cols-3">
          {[
            {
              icon: "📊",
              title: "Kelola Data",
              desc: "Data nasabah dan aktivitas bank sampah dapat dikelola secara lebih terstruktur.",
            },
            {
              icon: "♻️",
              title: "Setor Sampah",
              desc: "Catat setoran sampah dan pantau aktivitas nasabah dengan lebih praktis.",
            },
            {
              icon: "💰",
              title: "Pantau Saldo",
              desc: "Nasabah dapat mengetahui saldo dan riwayat transaksi dengan mudah.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-white p-8">
              <div className="text-2xl">{item.icon}</div>

              <h3 className="mt-5 text-lg font-semibold text-[#2C4A30]">
                {item.title}
              </h3>

              <p className="mt-2 text-sm font-light leading-6 text-[#8A9086]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CARA KERJA ================= */}
      <section
        id="cara-kerja"
        className="border-t border-[#EAE6DA] bg-white"
      >
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="mb-14 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#5C8A54]">
              Cara Kerja
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#2C4A30]">
              Mulai dalam 3 langkah
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                num: "01",
                title: "Daftar Akun",
                desc: "Buat akun untuk mulai menggunakan layanan Bank Sampah Digital.",
              },
              {
                num: "02",
                title: "Setorkan Sampah",
                desc: "Setorkan sampah sesuai jenis dan ketentuan yang tersedia.",
              },
              {
                num: "03",
                title: "Dapatkan Manfaat",
                desc: "Pantau saldo, transaksi, dan manfaat dari sampah yang kamu setorkan.",
              },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <p className="text-sm font-medium text-[#B9C4AF]">
                  {step.num}
                </p>

                <h3 className="mt-3 text-lg font-semibold text-[#2C4A30]">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm font-light leading-6 text-[#8A9086]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="bg-[#2C4A30]">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Siap mulai berkontribusi?
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm font-light leading-6 text-[#D6DCCE]">
            Mari bersama-sama menciptakan lingkungan yang lebih bersih dan
            berkelanjutan.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/nasabah-login"
              className="rounded-full bg-white px-8 py-3.5 text-sm font-medium text-[#2C4A30] transition hover:bg-[#F2EFE6]"
            >
              Login Nasabah
            </Link>

            <Link
              href="/admin-login"
              className="rounded-full border border-[#5C7457] px-8 py-3.5 text-sm font-medium text-white transition hover:bg-[#3B5C3B]"
            >
              Login Admin
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#2C4A30]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-8 text-center lg:px-8 sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="text-base">♻️</span>

            <span className="text-sm font-medium text-white">
              Bank Sampah Digital Hub
            </span>
          </div>

          <p className="text-xs font-light text-[#A9B4A1]">
            © 2026 Bank Sampah Digital Hub
          </p>
        </div>
      </footer>
    </main>
  );
}