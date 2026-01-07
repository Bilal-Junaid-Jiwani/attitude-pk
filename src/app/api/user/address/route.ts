import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";

const getDataFromToken = (request: NextRequest) => {
    try {
        const token = request.cookies.get("token")?.value || "";
        if (!token) return null;

        const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET!);
        return decodedToken.id;
    } catch (error: any) {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const userId = getDataFromToken(request);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { address, action } = await request.json();
        const user = await User.findById(userId);

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Add Address
        user.addresses.push(address);

        // If it's the first address, make it default
        if (user.addresses.length === 1) {
            user.addresses[0].isDefault = true;
        }

        await user.save();
        return NextResponse.json({ addresses: user.addresses });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await dbConnect();
        const userId = getDataFromToken(request);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { addressId, updates, action } = await request.json();
        const user = await User.findById(userId);

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const addrIndex = user.addresses.findIndex((a: any) => a._id.toString() === addressId);
        if (addrIndex === -1 && action !== 'add') return NextResponse.json({ error: "Address not found" }, { status: 404 });

        if (action === 'setDefault') {
            user.addresses.forEach((a: any) => a.isDefault = false);
            if (addrIndex > -1) user.addresses[addrIndex].isDefault = true;
        } else {
            // Update fields
            Object.assign(user.addresses[addrIndex], updates);
        }

        await user.save();
        return NextResponse.json({ addresses: user.addresses });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        const userId = getDataFromToken(request);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const addressId = request.nextUrl.searchParams.get('id');
        const user = await User.findById(userId);

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        user.addresses = user.addresses.filter((a: any) => a._id.toString() !== addressId);
        await user.save();

        return NextResponse.json({ addresses: user.addresses });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const userId = getDataFromToken(request);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await User.findById(userId);
        return NextResponse.json({ addresses: user?.addresses || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
