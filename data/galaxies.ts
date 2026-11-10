// Konten galaksi. Angka jarak dan ukuran adalah perkiraan; ditandai "perkiraan" bila tidak pasti.
// `video`: isi dengan URL EMBED resmi NASA/ESA yang sudah Anda verifikasi; `null` = "Video segera hadir".

import type { VideoRef } from "./planets";

export type ShapeId =
  | "milkyway"
  | "andromeda"
  | "lmc"
  | "smc"
  | "sombrero"
  | "arp273"
  | "ngc253"
  | "m64"
  | "m101";

export interface Galaxy {
  id: string;
  name: string;
  catalog: string;
  distance: string;
  morphology: string;
  description: string;
  shape: ShapeId;
  inclination: number; // derajat; 0 = menghadap kita, 90 = dari samping
  roll: number; // derajat, rotasi di bidang pandang
  spin: number; // rad/detik
  video: VideoRef;
}

export const galaxies: Galaxy[] = [
  {
    id: "milkyway",
    name: "Bima Sakti",
    catalog: "Galaksi kita (tanpa nomor katalog)",
    distance: "Matahari berada sekitar 26.000 tahun cahaya dari pusat (perkiraan)",
    morphology: "Spiral berbatang",
    description:
      "Bima Sakti adalah galaksi tempat Tata Surya berada. Cakramnya berdiameter sekitar 100.000 tahun cahaya (perkiraan) dan memuat ratusan miliar bintang (perkiraan). Di pusatnya terdapat lubang hitam supermasif Sagitarius A*. Matahari mengitari pusat galaksi sekali dalam sekitar 225 hingga 250 juta tahun (perkiraan).",
    shape: "milkyway",
    inclination: 28,
    roll: -18,
    spin: 0.05,
    video: null,
  },
  {
    id: "andromeda",
    name: "Andromeda",
    catalog: "M31 / NGC 224",
    distance: "sekitar 2,5 juta tahun cahaya",
    morphology: "Spiral",
    description:
      "Andromeda adalah galaksi spiral besar terdekat dari Bima Sakti dan dapat dilihat dengan mata telanjang dari langit yang gelap. Diameternya sekitar 220.000 tahun cahaya (perkiraan). Galaksi ini bergerak mendekati kita, dan banyak model memperkirakan keduanya akan bergabung dalam miliaran tahun, meski kepastiannya masih dikaji.",
    shape: "andromeda",
    inclination: 77,
    roll: -35,
    spin: 0.04,
    video: null,
  },
  {
    id: "lmc",
    name: "Awan Magellan Besar",
    catalog: "LMC (tanpa nomor Messier/NGC)",
    distance: "sekitar 160.000 tahun cahaya",
    morphology: "Tak beraturan dengan batang (galaksi satelit)",
    description:
      "Awan Magellan Besar adalah galaksi satelit Bima Sakti yang tampak dari belahan Bumi selatan. Di dalamnya terdapat Nebula Tarantula, salah satu daerah pembentukan bintang paling aktif di sekitar kita. Supernova 1987A, ledakan bintang terdekat yang teramati dalam era modern, terjadi di galaksi ini.",
    shape: "lmc",
    inclination: 35,
    roll: 20,
    spin: 0.03,
    video: null,
  },
  {
    id: "smc",
    name: "Awan Magellan Kecil",
    catalog: "SMC / NGC 292",
    distance: "sekitar 200.000 tahun cahaya (perkiraan)",
    morphology: "Katai tak beraturan (galaksi satelit)",
    description:
      "Awan Magellan Kecil adalah galaksi katai satelit Bima Sakti. Bentuknya tak beraturan dan terdistorsi oleh interaksi gravitasi dengan Awan Magellan Besar dan Bima Sakti. Diameternya sekitar 7.000 tahun cahaya (perkiraan), dan ia terlihat dengan mata telanjang dari belahan Bumi selatan.",
    shape: "smc",
    inclination: 40,
    roll: -10,
    spin: 0.03,
    video: null,
  },
  {
    id: "sombrero",
    name: "Sombrero",
    catalog: "M104 / NGC 4594",
    distance: "sekitar 29 juta tahun cahaya (perkiraan)",
    morphology: "Spiral dengan tonjolan inti sangat besar, dilihat hampir dari samping",
    description:
      "Galaksi Sombrero dinamai dari bentuknya yang mirip topi bertepi lebar. Tonjolan intinya sangat terang dan dikelilingi pita debu gelap yang tampak jelas pada cakramnya. Diameternya sekitar 50.000 tahun cahaya (perkiraan), dan di pusatnya terdapat lubang hitam supermasif.",
    shape: "sombrero",
    inclination: 84,
    roll: -6,
    spin: 0.03,
    video: null,
  },
  {
    id: "arp273",
    name: "Mawar (The Rose)",
    catalog: "Arp 273 / UGC 1810 dan UGC 1813",
    distance: "sekitar 300 juta tahun cahaya (perkiraan)",
    morphology: "Dua galaksi spiral yang berinteraksi",
    description:
      "Arp 273 terdiri dari dua galaksi spiral yang saling menarik lewat gravitasi. Galaksi yang lebih besar, UGC 1810, terdistorsi hingga lengannya membentuk pola menyerupai kelopak mawar. Interaksi seperti ini memicu pembentukan bintang baru dan dapat berujung pada penggabungan galaksi dalam rentang waktu sangat panjang.",
    shape: "arp273",
    inclination: 40,
    roll: 15,
    spin: 0.025,
    video: null,
  },
  {
    id: "ngc253",
    name: "Sculptor",
    catalog: "NGC 253",
    distance: "sekitar 11 juta tahun cahaya (perkiraan)",
    morphology: "Spiral berbatang menengah dengan ledakan pembentukan bintang",
    description:
      "Galaksi Sculptor adalah salah satu galaksi starburst terdekat, artinya ia membentuk bintang jauh lebih cepat daripada galaksi biasa. Dari Bumi ia tampak sangat miring sehingga debu di cakramnya terlihat jelas. Diameternya sekitar 90.000 tahun cahaya (perkiraan), dan ia menjadi anggota utama Kelompok Sculptor.",
    shape: "ngc253",
    inclination: 78,
    roll: -52,
    spin: 0.04,
    video: null,
  },
  {
    id: "m64",
    name: "Black Eye",
    catalog: "M64 / NGC 4826",
    distance: "sekitar 17 juta tahun cahaya (perkiraan)",
    morphology: "Spiral dengan pita debu gelap di dekat inti",
    description:
      "Galaksi Black Eye dinamai dari pita debu gelap yang melintasi sisi inti terangnya, seperti mata yang lebam. Gas di bagian dalamnya berputar berlawanan arah dengan gas di bagian luar, kemungkinan akibat penggabungan dengan galaksi lain di masa lalu. Diameternya sekitar 54.000 tahun cahaya (perkiraan).",
    shape: "m64",
    inclination: 58,
    roll: 25,
    spin: 0.04,
    video: null,
  },
  {
    id: "m101",
    name: "Blue Pinwheel",
    catalog: "M101 / NGC 5457 (identifikasi perkiraan)",
    distance: "sekitar 21 juta tahun cahaya (perkiraan)",
    morphology: "Spiral menghadap kita (face-on)",
    description:
      "Galaksi ini menghadap hampir tepat ke arah kita sehingga lengan spiralnya yang lebar terlihat utuh seperti kincir. Lengannya sarat bintang muda biru dan daerah pembentukan bintang. Diameternya sekitar 170.000 tahun cahaya (perkiraan), jauh lebih besar daripada Bima Sakti.",
    shape: "m101",
    inclination: 12,
    roll: 30,
    spin: 0.05,
    video: null,
  },
];
