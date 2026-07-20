-- CreateTable
CREATE TABLE "ServicioLiturgico" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "montoSugerido" DECIMAL(10,2) NOT NULL DEFAULT 10.00,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "requiereFestejado" BOOLEAN NOT NULL DEFAULT false,
    "labelFestejado" TEXT,
    "requiereFallecido" BOOLEAN NOT NULL DEFAULT false,
    "requiereConyuge" BOOLEAN NOT NULL DEFAULT false,
    "requierePadresPadrinos" BOOLEAN NOT NULL DEFAULT false,
    "documentosRequeridos" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicioLiturgico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HorarioDisponible" (
    "id" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "diaSemana" INTEGER,
    "fechaEspecifica" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HorarioDisponible_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HorarioDisponible_hora_diaSemana_fechaEspecifica_key" ON "HorarioDisponible"("hora", "diaSemana", "fechaEspecifica");
