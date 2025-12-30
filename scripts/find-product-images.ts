import { dbConnect } from '../src/lib/db/connect';
import Product from '../src/lib/db/models/Product';

async function findImages() {
    await dbConnect();

    const searchTerms = [
        "Baby Shampoo",
        "Bubble Wash",
        "Lotion",
        "Conditioner",
        "Dish",
        "Kids Shampoo"
    ];

    for (const term of searchTerms) {
        const products = await Product.find({ name: { $regex: term, $options: 'i' } }).select('name images slug');
        console.log(`\n--- Results for "${term}" ---`);
        products.forEach(p => {
            console.log(`Name: ${p.name}`);
            console.log(`Image: ${p.images[0]}`);
        });
    }
    process.exit();
}

findImages();
