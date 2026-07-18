-- CreateTable
CREATE TABLE "IntencionMisa" (
    "id" TEXT NOT NULL,
    "nombreSolicitante" TEXT NOT NULL,
    "emailSolicitante" TEXT NOT NULL,
    "telefonoSolicitante" TEXT NOT NULL,
    "tipoIntencion" TEXT NOT NULL,
    "nombreIntencion" TEXT NOT NULL,
    "fechaMisa" TIMESTAMP(3) NOT NULL,
    "horaMisa" TEXT NOT NULL,
    "montoOfrenda" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "codigoYape" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntencionMisa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bautizo" (
    "id" TEXT NOT NULL,
    "nombreBautizado" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "fechaBautizo" TIMESTAMP(3),
    "nombrePadre" TEXT NOT NULL,
    "nombreMadre" TEXT NOT NULL,
    "nombrePadrino" TEXT NOT NULL,
    "nombreMadrina" TEXT NOT NULL,
    "dniBautizado" TEXT NOT NULL,
    "dniPadres" TEXT NOT NULL,
    "dniPadrinos" TEXT NOT NULL,
    "documentoActaNacimientoUrl" TEXT,
    "documentoDniPadresUrl" TEXT,
    "documentoDniPadrinosUrl" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bautizo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feligres" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feligres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HorarioRestringido" (
    "id" TEXT NOT NULL,
    "fechaStr" TEXT NOT NULL,
    "hora" TEXT,
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HorarioRestringido_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Feligres_email_key" ON "Feligres"("email");

-- CreateIndex
CREATE UNIQUE INDEX "HorarioRestringido_fechaStr_hora_key" ON "HorarioRestringido"("fechaStr", "hora");

-- CreateIndex
CREATE UNIQUE INDEX "HorarioDisponible_hora_diaSemana_fechaEspecifica_key" ON "HorarioDisponible"("hora", "diaSemana", "fechaEspecifica");
