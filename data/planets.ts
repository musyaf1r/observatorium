// Konten planet. Semua angka adalah nilai rata-rata yang umum dipakai NASA.
// `video`: isi dengan URL EMBED resmi (mis. https://www.youtube.com/embed/<id> dari kanal NASA/ESA)
// hanya setelah URL itu Anda verifikasi sendiri. Biarkan `null` agar tampil "Video segera hadir".

export type VideoRef = { url: string; title: string } | null;

export type SurfaceKind = "earth" | "mars" | "bands" | "ice";

export interface Planet {
  id: string;
  name: string;
  image2d: string;
  model3d: string;
  type: string;
  distance: string; // jarak rata-rata dari Matahari
  diameter: string; // diameter ekuator
  description: string;
  tilt: number; // kemiringan sumbu (derajat)
  scale: number; // penyesuaian ukuran di kanvas
  ring: boolean;
  surface: { kind: SurfaceKind; palette: string[]; freq?: number; spot?: boolean };
  video: VideoRef;
}

export const planets: Planet[] = [
  {
    id: "mercury",
    name: "Merkurius",
    image2d: "/pelanet%202d/3715b194acce189db5e21c3b0f031291-removebg-preview.png",
    model3d: "/3d%20pelanet/Mercury_1_4878.glb",
    type: "Planet terestrial (berbatu)",
    distance: "57,9 juta km (0,39 SA)",
    diameter: "4.879 km",
    description:
      "Merkurius adalah planet terkecil dan terdekat dari Matahari. Permukaannya dipenuhi kawah, sementara atmosfernya yang sangat tipis membuat suhu siang dan malam berbeda ekstrem. Satu tahun di Merkurius berlangsung sekitar 88 hari Bumi.",
    tilt: 0.034,
    scale: 0.48,
    ring: false,
    surface: { kind: "mars", palette: ["#70675d", "#a99c8b", "#49433d"] },
    video: null,
  },
  {
    id: "venus",
    name: "Venus",
    image2d: "/pelanet%202d/0d18dd86a553318da0655a878da54fd5-removebg-preview.png",
    model3d: "/3d%20pelanet/Venussurface_1_12103.glb",
    type: "Planet terestrial (berbatu)",
    distance: "108,2 juta km (0,72 SA)",
    diameter: "12.104 km",
    description:
      "Venus adalah planet terpanas di Tata Surya karena atmosfer tebal yang kaya karbon dioksida memerangkap panas. Awan asam sulfat menutupi permukaannya, dan planet ini berotasi berlawanan arah dengan kebanyakan planet lainnya.",
    tilt: 177.4,
    scale: 0.95,
    ring: false,
    surface: { kind: "mars", palette: ["#a84f23", "#e7a54a", "#704020"] },
    video: null,
  },
  {
    id: "earth",
    name: "Bumi",
    image2d: "/pelanet%202d/2a7af859ad2dcd2fe21dab30d61a3cd4-removebg-preview.png",
    model3d: "/3d%20pelanet/Earth_1_12756.glb",
    type: "Planet terestrial (berbatu)",
    distance: "149,6 juta km (1 SA)",
    diameter: "12.756 km",
    description:
      "Bumi adalah satu-satunya dunia yang kita ketahui menopang kehidupan. Sekitar 71 persen permukaannya tertutup air, dan atmosfer yang kaya nitrogen dan oksigen menjaga suhu serta menahan sebagian besar radiasi berbahaya. Satu hari berlangsung sekitar 24 jam dan satu tahun sekitar 365,25 hari.",
    tilt: 23.4,
    scale: 1,
    ring: false,
    surface: { kind: "earth", palette: ["#0a2a5c", "#1c5fa8", "#2f6b3a", "#9a8a55", "#f2f6fa"] },
    video: null,
  },
  {
    id: "mars",
    name: "Mars",
    image2d: "/pelanet%202d/266cd83717c28f2b90dd0fe9317d105f-removebg-preview.png",
    model3d: "/3d%20pelanet/24881_Mars_1_6792.glb",
    type: "Planet terestrial (berbatu)",
    distance: "227,9 juta km (1,52 SA)",
    diameter: "6.792 km",
    description:
      "Mars tampak kemerahan karena debu kaya besi oksida di permukaannya. Atmosfernya tipis, sebagian besar karbon dioksida, sehingga suhunya sangat dingin. Planet ini memiliki Olympus Mons, gunung berapi terbesar yang diketahui di Tata Surya, dan menyimpan bukti kuat bahwa air cair pernah mengalir di sana.",
    tilt: 25.2,
    scale: 0.82,
    ring: false,
    surface: { kind: "mars", palette: ["#b5532e", "#d98a58", "#6e3320"] },
    video: null,
  },
  {
    id: "jupiter",
    name: "Jupiter",
    image2d: "/pelanet%202d/bf7396596110405d270c6c5adc1ce587-removebg-preview.png",
    model3d: "/3d%20pelanet/Jupiter_1_142984.glb",
    type: "Raksasa gas",
    distance: "778,5 juta km (5,2 SA)",
    diameter: "142.984 km",
    description:
      "Jupiter adalah planet terbesar di Tata Surya, tersusun terutama dari hidrogen dan helium. Pita awannya terbentuk oleh angin kencang yang berlawanan arah. Bintik Merah Besar adalah badai raksasa yang telah diamati selama berabad-abad, dan satu hari di Jupiter hanya sekitar 10 jam.",
    tilt: 3.1,
    scale: 1.05,
    ring: false,
    surface: {
      kind: "bands",
      palette: ["#d9c2a0", "#b98a62", "#e8dccb", "#a8704c", "#cfae8a"],
      freq: 20,
      spot: true,
    },
    video: null,
  },
  {
    id: "saturn",
    name: "Saturnus",
    image2d: "/pelanet%202d/d34893a45dfbb775e9a80506ef98b7da-removebg-preview.png",
    model3d: "/3d%20pelanet/Saturn_1_120536.glb",
    type: "Raksasa gas",
    distance: "1,43 miliar km (9,58 SA)",
    diameter: "120.536 km",
    description:
      "Saturnus terkenal dengan cincinnya yang terdiri dari es air dan serpihan batuan dalam jumlah sangat besar, namun tipis sekali jika dibandingkan lebarnya. Kerapatan rata-rata planet ini lebih kecil daripada air. Atmosfernya sebagian besar hidrogen dan helium dengan pita awan yang lebih lembut daripada Jupiter.",
    tilt: 26.7,
    scale: 0.62,
    ring: true,
    surface: { kind: "bands", palette: ["#e6d3a3", "#cdb67f", "#f1e4bf", "#bfa56e"], freq: 14 },
    video: null,
  },
  {
    id: "uranus",
    name: "Uranus",
    image2d: "/pelanet%202d/34c9cfdf81034488fb1398cb37fa36b3.png",
    model3d: "/3d%20pelanet/Uranus_1_51118.glb",
    type: "Raksasa es",
    distance: "2,87 miliar km (19,2 SA)",
    diameter: "50.724 km",
    description:
      "Uranus adalah raksasa es dengan atmosfer kaya hidrogen, helium, dan metana yang memberi warna biru kehijauan. Sumbu rotasinya sangat miring, sehingga planet ini tampak berputar seperti menggelinding mengelilingi Matahari.",
    tilt: 97.8,
    scale: 0.88,
    ring: false,
    surface: { kind: "ice", palette: ["#72aeb5", "#9ed5d8", "#387a89"] },
    video: null,
  },
  {
    id: "neptune",
    name: "Neptunus",
    image2d: "/pelanet%202d/11e7f46b3c8b0d461ed4718c794481bb.png",
    model3d: "/3d%20pelanet/Neptune_1_49528.glb",
    type: "Raksasa es",
    distance: "4,50 miliar km (30,1 SA)",
    diameter: "49.244 km",
    description:
      "Neptunus adalah planet terjauh dari Matahari. Warna birunya yang pekat sebagian berasal dari metana di atmosfer yang menyerap cahaya merah. Planet ini memiliki angin tercepat di Tata Surya, dan baru satu wahana, Voyager 2 pada 1989, yang pernah melintas dekat. Satu tahun Neptunus setara sekitar 165 tahun Bumi.",
    tilt: 28.3,
    scale: 0.92,
    ring: false,
    surface: { kind: "ice", palette: ["#1e3a8a", "#2f5fd0", "#4f86f0", "#15286b"] },
    video: null,
  },
];
