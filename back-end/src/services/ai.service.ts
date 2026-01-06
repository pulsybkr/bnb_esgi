import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export class AiService {
    private model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-3-flash-preview" });

    async generateDescription(data: { description: string }) {
        const { description } = data;

        const prompt = `
      Tu es un expert en marketing immobilier pour une plateforme de location de vacances style Airbnb, spécialisée dans les pays d'Afrique francophone.
      Ta mission est d'améliorer ou de rédiger une description de logement à partir des notes ou de la description brute fournie par l'utilisateur.

      Notes/Description brute :
      ${description}

      Instructions :
      1. Rédige une description structurée, élégante et très attractive.
      2. Utilise un ton professionnel, chaleureux et accueillant.
      3. Utilise des emojis de manière pertinente pour rendre le texte vivant ✨.
      4. Utilise des listes à puces pour lister les équipements ou points forts si cela s'y prête.
      5. Reste fidèle aux informations fournies : ne donne pas de fausses informations (ne pas inventer de piscine si non mentionnée).
      6. Adapte la longueur : ne fais pas une description inutilement longue si les notes sont très succinctes. Sois concis tout en étant vendeur.
      7. Ne donne QUE le texte de la description, sans introduction ni conclusion de ta part.

      Réponse en français.
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini AI Error:", error);
            throw new Error("Erreur lors de la génération de la description par l'IA.");
        }
    }
}

export default new AiService();
