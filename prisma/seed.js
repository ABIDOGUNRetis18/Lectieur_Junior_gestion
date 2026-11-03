const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv/config");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const premierDimanche = new Date();
  const day = premierDimanche.getUTCDay();
  const diff = day === 0 ? 0 : day;
  premierDimanche.setUTCDate(premierDimanche.getUTCDate() - diff);
  premierDimanche.setUTCHours(0, 0, 0, 0);

  const groupe = await prisma.groupe.upsert({
    where: { slug: "paroisse-saint-michel-gbeto" },
    update: {},
    create: {
      nom: "Paroisse Saint-Michel Gbeto",
      slug: "paroisse-saint-michel-gbeto",
      moisDebutAnnee: 10,
      moisSansReunion: [7, 8, 9],
      premierDimanche,
      montantCotisation: 100,
    },
  });
  console.log("Groupe:", groupe.nom);

  const nomsFraternites = ["Fraternité 1", "Fraternité 2", "Fraternité 3", "Fraternité 4", "Fraternité 5"];
  const fraternites = {};
  for (const nom of nomsFraternites) {
    const f = await prisma.fraternite.upsert({
      where: { groupeId_nom: { groupeId: groupe.id, nom } },
      update: {},
      create: { nom, groupeId: groupe.id },
    });
    fraternites[nom] = f;
    console.log("Fraternité:", f.nom);
  }

  const adminEmail = "admin@paroisse.bj";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nom: "Administrateur",
      email: adminEmail,
      passwordHash: await bcrypt.hash("AdminParoisse2024!", 12),
      role: "ADMIN",
      groupeId: groupe.id,
    },
  });
  console.log("Admin:", admin.email);

  const demos = [
    { nom: "Responsable Frat 2", email: "responsable@paroisse.bj", role: "RESPONSABLE", fraternite: "Fraternité 2" },
  ];
  for (const d of demos) {
    await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: {
        nom: d.nom,
        email: d.email,
        passwordHash: await bcrypt.hash("DemoParoisse2024!", 12),
        role: d.role,
        groupeId: groupe.id,
        fraterniteId: d.fraternite ? fraternites[d.fraternite].id : null,
      },
    });
    console.log("Demo:", d.email, d.role);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
