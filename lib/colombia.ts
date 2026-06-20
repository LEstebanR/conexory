export type Departamento = {
  name: string
  cities: string[]
}

export const DEPARTAMENTOS: Departamento[] = [
  {
    name: "Amazonas",
    cities: ["Leticia", "Puerto Nariño"],
  },
  {
    name: "Antioquia",
    cities: [
      "Medellín", "Bello", "Itagüí", "Envigado", "Rionegro", "Apartadó",
      "Turbo", "Caucasia", "Sabaneta", "La Estrella", "Copacabana", "Girardota",
      "El Retiro", "Marinilla", "Caldas", "La Ceja", "Barbosa", "Yarumal",
    ],
  },
  {
    name: "Arauca",
    cities: ["Arauca", "Saravena", "Tame", "Fortul", "Arauquita"],
  },
  {
    name: "Atlántico",
    cities: [
      "Barranquilla", "Soledad", "Malambo", "Sabanalarga", "Galapa",
      "Baranoa", "Puerto Colombia", "Palmar de Varela",
    ],
  },
  {
    name: "Bolívar",
    cities: [
      "Cartagena", "Magangué", "Turbaco", "Arjona", "El Carmen de Bolívar",
      "Mompox", "San Jacinto", "Cicuco",
    ],
  },
  {
    name: "Boyacá",
    cities: [
      "Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa", "Puerto Boyacá",
      "Moniquirá", "Ramiriquí", "Samacá", "Nobsa",
    ],
  },
  {
    name: "Caldas",
    cities: [
      "Manizales", "La Dorada", "Chinchiná", "Riosucio", "Salamina",
      "Villamaría", "Anserma", "Manzanares", "Neira", "Supía",
    ],
  },
  {
    name: "Caquetá",
    cities: ["Florencia", "San Vicente del Caguán", "Puerto Rico", "Belén de los Andaquíes"],
  },
  {
    name: "Casanare",
    cities: ["Yopal", "Aguazul", "Villanueva", "Tauramena", "Paz de Ariporo", "Trinidad"],
  },
  {
    name: "Cauca",
    cities: [
      "Popayán", "Santander de Quilichao", "Puerto Tejada", "Caloto", "Patía",
      "Coconuco", "Piendamó", "Cajibío", "Timbío",
    ],
  },
  {
    name: "Cesar",
    cities: [
      "Valledupar", "Aguachica", "Codazzi", "La Jagua de Ibirico",
      "El Copey", "Bosconia", "Chimichagua", "Chiriguaná",
    ],
  },
  {
    name: "Chocó",
    cities: ["Quibdó", "Istmina", "Condoto", "Bahía Solano", "Nuquí"],
  },
  {
    name: "Córdoba",
    cities: [
      "Montería", "Cereté", "Lorica", "Montelíbano", "Sahagún",
      "Tierralta", "Planeta Rica", "Ayapel", "Ciénaga de Oro",
    ],
  },
  {
    name: "Cundinamarca",
    cities: [
      "Bogotá D.C.", "Soacha", "Fusagasugá", "Zipaquirá", "Facatativá",
      "Chía", "Mosquera", "Madrid", "Funza", "Cajicá", "Tocancipá",
      "Sopó", "La Calera", "Sibaté", "Girardot", "Villeta", "Cota",
      "Tabio", "Tenjo", "Bojacá",
    ],
  },
  {
    name: "Guainía",
    cities: ["Inírida"],
  },
  {
    name: "Guaviare",
    cities: ["San José del Guaviare", "El Retorno", "Miraflores"],
  },
  {
    name: "Huila",
    cities: [
      "Neiva", "Pitalito", "Garzón", "La Plata", "Campoalegre",
      "Rivera", "Palermo", "Baraya", "Timana", "Isnos",
    ],
  },
  {
    name: "La Guajira",
    cities: ["Riohacha", "Maicao", "Uribia", "Manaure", "Fonseca", "San Juan del Cesar"],
  },
  {
    name: "Magdalena",
    cities: [
      "Santa Marta", "Ciénaga", "Fundación", "El Banco", "Plato",
      "Aracataca", "Pivijay", "Salamina", "Santa Ana",
    ],
  },
  {
    name: "Meta",
    cities: [
      "Villavicencio", "Acacías", "Granada", "San Martín", "Restrepo",
      "Cumaral", "Puerto Gaitán", "Castilla la Nueva",
    ],
  },
  {
    name: "Nariño",
    cities: [
      "Pasto", "Tumaco", "Ipiales", "Túquerres", "La Unión",
      "Samaniego", "El Charco", "Barbacoas", "Sandoná",
    ],
  },
  {
    name: "Norte de Santander",
    cities: [
      "Cúcuta", "Ocaña", "Pamplona", "Villa del Rosario", "Los Patios",
      "El Zulia", "Tibú", "Abrego", "Chinácota",
    ],
  },
  {
    name: "Putumayo",
    cities: ["Mocoa", "Puerto Asís", "Orito", "Valle del Guamuez", "Puerto Leguízamo"],
  },
  {
    name: "Quindío",
    cities: [
      "Armenia", "Calarcá", "Circasia", "Montenegro", "Quimbaya",
      "La Tebaida", "Génova", "Salento", "Buenavista",
    ],
  },
  {
    name: "Risaralda",
    cities: [
      "Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia",
      "Marsella", "Quinchía", "Belén de Umbría", "Apía",
    ],
  },
  {
    name: "San Andrés y Providencia",
    cities: ["San Andrés", "Providencia"],
  },
  {
    name: "Santander",
    cities: [
      "Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja",
      "San Gil", "Socorro", "Barbosa", "Vélez", "Lebrija", "Rionegro",
    ],
  },
  {
    name: "Sucre",
    cities: [
      "Sincelejo", "Corozal", "Sampués", "San Marcos", "Morroa",
      "Tolú", "Coveñas", "San Onofre",
    ],
  },
  {
    name: "Tolima",
    cities: [
      "Ibagué", "Espinal", "Melgar", "Honda", "Líbano",
      "Flandes", "Mariquita", "Chaparral", "Purificación",
    ],
  },
  {
    name: "Valle del Cauca",
    cities: [
      "Cali", "Buenaventura", "Palmira", "Tuluá", "Buga",
      "Cartago", "Yumbo", "Jamundí", "Candelaria", "El Cerrito",
      "Florida", "Pradera", "Sevilla", "Zarzal", "Roldanillo",
    ],
  },
  {
    name: "Vaupés",
    cities: ["Mitú"],
  },
  {
    name: "Vichada",
    cities: ["Puerto Carreño", "La Primavera", "Cumaribo"],
  },
]

export const DEPARTAMENTO_NAMES = DEPARTAMENTOS.map((d) => d.name)

export function getCitiesForDepartamento(departamento: string): string[] {
  return DEPARTAMENTOS.find((d) => d.name === departamento)?.cities ?? []
}
