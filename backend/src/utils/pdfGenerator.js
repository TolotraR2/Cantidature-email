import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generateLettrePDF = (entreprise, config, outputPath, lettrePersonnalisee) => {
  return new Promise((resolve, reject) => {
    try {
      // Format A4 (210x297mm, 72 dpi = 595x842 points)
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      const leftX = 50;
      const rightX = 350;
      let currentY = 50;

      // ========== EN-TÊTE GAUCHE: Mes informations ==========
      doc.fontSize(11).font('Helvetica-Bold').text(config.nom_complet, leftX, currentY, { width: 250 });
      currentY += 18;
      
      doc.fontSize(10).font('Helvetica').text(config.adresse || 'Adresse', leftX, currentY, { width: 250 });
      currentY += 15;
      
      doc.text(`${config.telephone || 'Téléphone'}`, leftX, currentY, { width: 250 });
      currentY += 15;
      
      doc.text(`${config.email}`, leftX, currentY, { width: 250 });
      currentY += 25; // Espacement de 25px avant les infos d'entreprise

      // ========== EN-TÊTE DROITE: Infos entreprise et date ==========
      const rightY = currentY;
      
      doc.fontSize(10).font('Helvetica').text(entreprise.nom_entreprise, rightX, rightY, { width: 195, align: 'left' });
      let rightCurrentY = rightY + 15;
      
      doc.text(entreprise.email || '', rightX, rightCurrentY, { width: 195, align: 'left' });
      rightCurrentY += 15;
      
      // Date d'envoi simplement
      const today = new Date().toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      doc.text(today, rightX, rightCurrentY, { width: 195, align: 'left' });
      rightCurrentY += 25;

      // ========== OBJET (à gauche) ==========
      currentY = rightCurrentY;
      doc.fontSize(11).font('Helvetica-Bold').text(`Objet : Candidature – ${config.poste_recherche}`, leftX, currentY, { width: 450 });
      currentY += 22;

      // ========== CONTENU DE LA LETTRE ==========
      doc.fontSize(10).font('Helvetica').text('Madame, Monsieur,', leftX, currentY, { width: 450 });
      currentY += 16;

      // Lettre personnalisée
      const lettre = lettrePersonnalisee || `Je vous écris pour vous proposer ma candidature au poste de ${config.poste_recherche} au sein de votre entreprise ${entreprise.nom_entreprise}.`;
      
      doc.fontSize(10).font('Helvetica').text(lettre, leftX, currentY, { 
        width: 450, 
        align: 'justify',
        lineGap: 2
      });

      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  generateLettrePDF
};
