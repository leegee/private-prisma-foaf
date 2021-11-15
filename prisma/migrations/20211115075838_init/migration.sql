-- CreateTable
CREATE TABLE "Person" (
    "id" SERIAL NOT NULL,
    "fullname" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Person2Person" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Person2Person_AB_unique" ON "_Person2Person"("A", "B");

-- CreateIndex
CREATE INDEX "_Person2Person_B_index" ON "_Person2Person"("B");

-- AddForeignKey
ALTER TABLE "_Person2Person" ADD FOREIGN KEY ("A") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Person2Person" ADD FOREIGN KEY ("B") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
