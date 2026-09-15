import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F2EDE0] text-[#2C4A30]">
      {/* ================= NAVBAR ================= */}
      <header className="w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5C8A54] text-2xl shadow-sm">
              ♻️
            </div>

            <div>
              <h1 className="text-lg font-bold leading-none text-[#2C4A30]">
                Bank Sampah
              </h1>

              <p className="mt-1 text-xs text-[#6F7C70]">
                Digital Hub
              </p>
            </div>
          </Link>

          {/* NAVIGATION */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#tentang"
              className="text-sm font-medium text-[#536956] transition hover:text-[#5C8A54]"
            >
              Tentang
            </a>

            <a
              href="#fitur"
              className="text-sm font-medium text-[#536956] transition hover:text-[#5C8A54]"
            >
              Fitur
            </a>

            <a
              href="#cara-kerja"
              className="text-sm font-medium text-[#536956] transition hover:text-[#5C8A54]"
            >
              Cara Kerja
            </a>
          </nav>

          {/* LOGIN */}
          <Link
            href="/sign-in"
            className="rounded-full bg-[#2C4A30] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#486F43]"
          >
            Masuk
          </Link>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-[#E7E0D0] blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-[#ECE6D9] blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-12 lg:grid-cols-2 lg:px-10 lg:pb-28 lg:pt-20">
          {/* HERO TEXT */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D8D0BF] bg-white px-4 py-2 text-sm font-medium text-[#536956] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#A9812F]" />
              Bersama Menjaga Lingkungan
            </div>

            <h2 className="max-w-2xl text-5xl font-extrabold leading-[1.08] tracking-tight text-[#2C4A30] sm:text-6xl">
              Sampah Jadi
              <span className="block text-[#5C8A54]">
                Lebih Berharga.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-[#667166] sm:text-lg">
              Kelola sampah dengan lebih mudah, dapatkan manfaatnya,
              dan ikut menciptakan lingkungan yang lebih bersih melalui
              Bank Sampah Digital Hub.
            </p>

            {/* BUTTON */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/nasabah-login"
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#2C4A30] px-7 py-4 font-semibold text-white shadow-lg shadow-[#2C4A30]/15 transition hover:-translate-y-0.5 hover:bg-[#486F43]"
              >
                Login Nasabah
                <span>→</span>
              </Link>

              <Link
                href="/admin-login"
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#D2C9B7] bg-white px-7 py-4 font-semibold text-[#5C8A54] transition hover:bg-[#F2EDE0]"
              >
                Login Admin
              </Link>
            </div>

            {/* MINI STATS */}
            <div className="mt-10 flex flex-wrap gap-8">
              <div>
                <p className="text-2xl font-bold text-[#2C4A30]">
                  100%
                </p>

                <p className="text-sm text-[#737A70]">
                  Digital
                </p>
              </div>

              <div className="h-10 w-px bg-[#D8D0BF]" />

              <div>
                <p className="text-2xl font-bold text-[#2C4A30]">
                  ♻️
                </p>

                <p className="text-sm text-[#737A70]">
                  Ramah Lingkungan
                </p>
              </div>

              <div className="h-10 w-px bg-[#D8D0BF]" />

              <div>
                <p className="text-2xl font-bold text-[#2C4A30]">
                  Mudah
                </p>

                <p className="text-sm text-[#737A70]">
                  Digunakan
                </p>
              </div>
            </div>
          </div>

          {/* HERO CARD */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#E7E0D0] p-6 shadow-2xl shadow-[#2C4A30]/10 sm:p-8">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#D5CCB9]" />
              <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-[#DDD5C5]" />

              <div className="relative">
                {/* ILLUSTRATION */}
                <div className="flex h-72 items-center justify-center rounded-[2rem] bg-[#FBF8F0]">
                  <div className="text-center">
                    <div className="text-8xl">
                      🌱
                    </div>

                    <div className="mt-4 rounded-2xl bg-white px-6 py-4 shadow-sm">
                      <p className="text-sm font-medium text-[#70776D]">
                        Kelola sampahmu
                      </p>

                      <p className="mt-1 text-xl font-bold text-[#5C8A54]">
                        Jadi lebih bernilai
                      </p>
                    </div>
                  </div>
                </div>

                {/* FLOATING CARD */}
                <div className="absolute -bottom-5 -left-4 rounded-2xl bg-white p-4 shadow-xl sm:-left-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E7E0D0] text-xl">
                      ♻️
                    </div>

                    <div>
                      <p className="text-xs text-[#7A7C72]">
                        Sampah Terkumpul
                      </p>

                      <p className="font-bold text-[#2C4A30]">
                        Lebih Terorganisir
                      </p>
                    </div>
                  </div>
                </div>

                {/* FLOATING GOLD */}
                <div className="absolute -right-3 top-10 rounded-2xl bg-[#A9812F] px-4 py-3 text-white shadow-xl sm:-right-5">
                  <p className="text-xs opacity-80">
                    Manfaat
                  </p>

                  <p className="font-bold">
                    ♻️ + 💰
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TENTANG ================= */}
      <section
        id="tentang"
        className="border-y border-[#DED6C7] bg-[#FBF8F0]"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#5C8A54]">
              Tentang Kami
            </p>

            <h3 className="mt-3 text-3xl font-bold text-[#2C4A30] sm:text-4xl">
              Mengubah kebiasaan,
              <br />
              menjaga lingkungan.
            </h3>

            <p className="mt-5 leading-7 text-[#6D746B]">
              Bank Sampah Digital Hub membantu nasabah dan pengelola
              bank sampah mengelola aktivitas persampahan secara
              lebih mudah dan terorganisir.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FITUR ================= */}
      <section
        id="fitur"
        className="bg-[#F2EDE0]"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-[#5C8A54]">
              Fitur
            </p>

            <h3 className="mt-2 text-3xl font-bold text-[#2C4A30] sm:text-4xl">
              Semua lebih mudah dalam satu tempat.
            </h3>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* CARD 1 */}
            <div className="rounded-3xl bg-[#FBF8F0] p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7E0D0] text-2xl">
                📊
              </div>

              <h4 className="mt-6 text-xl font-bold text-[#2C4A30]">
                Kelola Data
              </h4>

              <p className="mt-3 leading-6 text-[#737A70]">
                Data nasabah dan aktivitas bank sampah dapat
                dikelola secara lebih terstruktur.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="rounded-3xl bg-[#FBF8F0] p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7E0D0] text-2xl">
                ♻️
              </div>

              <h4 className="mt-6 text-xl font-bold text-[#2C4A30]">
                Setor Sampah
              </h4>

              <p className="mt-3 leading-6 text-[#737A70]">
                Catat setoran sampah dan pantau aktivitas
                nasabah dengan lebih praktis.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="rounded-3xl bg-[#FBF8F0] p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7E0D0] text-2xl">
                💰
              </div>

              <h4 className="mt-6 text-xl font-bold text-[#2C4A30]">
                Pantau Saldo
              </h4>

              <p className="mt-3 leading-6 text-[#737A70]">
                Nasabah dapat mengetahui saldo dan riwayat
                transaksi dengan mudah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CARA KERJA ================= */}
      <section
        id="cara-kerja"
        className="bg-[#FBF8F0]"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#5C8A54]">
              Cara Kerja
            </p>

            <h3 className="mt-3 text-3xl font-bold text-[#2C4A30] sm:text-4xl">
              Mulai dalam 3 langkah
            </h3>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* STEP 01 */}
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#2C4A30] text-lg font-bold text-white">
                01
              </div>

              <h4 className="mt-5 font-bold text-[#2C4A30]">
                Daftar Akun
              </h4>

              <p className="mt-2 text-sm leading-6 text-[#737A70]">
                Buat akun untuk mulai menggunakan layanan
                Bank Sampah Digital.
              </p>
            </div>

            {/* STEP 02 */}
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#2C4A30] text-lg font-bold text-white">
                02
              </div>

              <h4 className="mt-5 font-bold text-[#2C4A30]">
                Setorkan Sampah
              </h4>

              <p className="mt-2 text-sm leading-6 text-[#737A70]">
                Setorkan sampah sesuai jenis dan ketentuan
                yang tersedia.
              </p>
            </div>

            {/* STEP 03 */}
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#2C4A30] text-lg font-bold text-white">
                03
              </div>

              <h4 className="mt-5 font-bold text-[#2C4A30]">
                Dapatkan Manfaat
              </h4>

              <p className="mt-2 text-sm leading-6 text-[#737A70]">
                Pantau saldo, transaksi, dan manfaat dari
                sampah yang kamu setorkan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="bg-[#2C4A30]">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h3 className="text-3xl font-bold text-white sm:text-4xl">
            Siap mulai berkontribusi?
          </h3>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-[#E1E3D8]">
            Mari bersama-sama menciptakan lingkungan yang lebih
            bersih dan berkelanjutan.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/sign-in"
              className="rounded-2xl bg-[#FBF8F0] px-7 py-3.5 font-semibold text-[#2C4A30] transition hover:bg-[#F2EDE0]"
            >
              Login Nasabah
            </Link>

            <Link
              href="/admin-login"
              className="rounded-2xl border border-[#84947D] px-7 py-3.5 font-semibold text-white transition hover:bg-[#486F43]"
            >
              Login Admin
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#2C4A30]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-7 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="flex items-center gap-3">
            <span className="text-xl">
              ♻️
            </span>

            <div>
              <p className="font-semibold text-white">
                Bank Sampah Digital Hub
              </p>

              <p className="text-xs text-[#C8CEC1]">
                Bersama untuk lingkungan yang lebih baik.
              </p>
            </div>
          </div>

          <p className="text-xs text-[#C8CEC1]">
            © 2026 Bank Sampah Digital Hub
          </p>
        </div>
      </footer>
    </main>
  );
}