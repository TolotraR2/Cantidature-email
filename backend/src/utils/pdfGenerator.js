import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generateLettrePDF = (entreprise, config, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      // En-tête
      doc.fontSize(14).font('Helvetica-Bold').text(config.nom_complet, 100, 50);
      doc.fontSize(10).font('Helvetica').text(config.adresse || '', 100, 75);
      doc.text(`Email: ${config.email}`, 100, 100);
      doc.text(`Téléphone: ${config.telephone}`, 100, 115);

      // Date
      doc.text(`À ${entreprise.ville}, le ${new Date().toLocaleDateString('fr-FR')}`, 100, 150);

      // Destinataire
      doc.moveDown();
      doc.text(entreprise.nom_entreprise);
      doc.text(entreprise.ville);

      // Objet
      doc.moveDown();
      doc.fontSize(11).font('Helvetica-Bold').text(`Objet: Candidature – ${config.poste_recherche}`);

      // Contenu
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').text('Madame, Monsieur,');

      doc.moveDown();
      const template = config.template_actif || `Je vous écris pour vous proposer ma candidature au poste de ${config.poste_recherche} au sein de votre entreprise ${entreprise.nom_entreprise}.`;
      const lettre = template
        .replace(/{entreprise}/g, entreprise.nom_entreprise)
        .replace(/{ville}/g, entreprise.ville)
        .replace(/{date}/g, new Date().toLocaleDateString('fr-FR'));
      
      doc.text(lettre, { align: 'justify' });

      doc.moveDown();
      doc.text('Je reste à votre disposition pour discuter de mes qualifications et de la façon dont je pourrais contribuer au succès de votre équipe.');

      doc.moveDown();
      doc.text('Cordialement,');
      doc.moveDown(2);
      doc.text(config.nom_complet);

      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

export const generateCVPDF = (config, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      // En-tête
      doc.fontSize(16).font('Helvetica-Bold').text(config.nom_complet, 50, 50);
      doc.fontSize(10).font('Helvetica').text(config.email, 50, 75);
      if (config.telephone) doc.text(`Téléphone: ${config.telephone}`, 50, 90);
      if (config.adresse) doc.text(config.adresse, 50, 105);

      // Poste recherché
      doc.moveDown(2);
      doc.fontSize(12).font('Helvetica-Bold').text('Poste Recherché');
      doc.fontSize(10).font('Helvetica').text(config.poste_recherche || 'Non spécifié');

      // Compétences
      doc.moveDown(2);
      doc.fontSize(12).font('Helvetica-Bold').text('Compétences');
      doc.fontSize(10).font('Helvetica').text(config.competences || 'À compléter dans la configuration');

      // Formation
      doc.moveDown(2);
      doc.fontSize(12).font('Helvetica-Bold').text('Formation');
      doc.fontSize(10).font('Helvetica').text(config.formation || 'À compléter dans la configuration');

      // Expérience
      doc.moveDown(2);
      doc.fontSize(12).font('Helvetica-Bold').text('Expérience Professionnelle');
      doc.fontSize(10).font('Helvetica').text(config.experience || 'À compléter dans la configuration');

      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  generateLettrePDF,
  generateCVPDF
};
