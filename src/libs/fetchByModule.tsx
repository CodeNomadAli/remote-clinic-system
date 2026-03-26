import prisma from "@/db";

export async function fetchByModule(module: string, id: string) {
    try {
        const map: Record<string, any> = {
            users: prisma.user,
            patients: prisma.patient,
            products: prisma.products,
        };

        const model = map[module];

        if (!model) return null;

        return await model.findUnique({
            where: { id },
        });
    } catch (error) {
        console.error("Dynamic fetch error:", error);

        return null;
    }
}
