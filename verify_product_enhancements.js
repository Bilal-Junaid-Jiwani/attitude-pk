// Native fetch is available in Node 18+

const BASE_URL = 'http://localhost:3000/api/admin/products';
// Mock Category ID (You might need a real one if validation is strict, assuming loose for now or existing)
// Actually we need valid category IDs. Let's try to fetch categories first.

async function verify() {
    try {
        // 1. Fetch a category to use
        const catRes = await fetch('http://localhost:3000/api/admin/categories');
        const categories = await catRes.json();
        if (categories.length === 0) {
            console.log('No categories found, cannot test product creation');
            return;
        }
        const categoryId = categories[0]._id;

        // 2. Create Product with Multiple Images
        const newProduct = {
            name: 'Test Product Multi',
            description: 'Testing multiple images',
            price: 100,
            stock: 10,
            category: categoryId,
            imageUrl: 'img1.jpg',
            images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
            isActive: true
        };

        console.log('Creating product...');
        const createRes = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });

        if (!createRes.ok) {
            console.error('Create failed:', await createRes.text());
            return;
        }
        const createdProduct = await createRes.json();
        console.log('Created Product ID:', createdProduct._id);
        console.log('Images:', createdProduct.images);

        if (createdProduct.images.length !== 3) throw new Error('Images not saved correctly');

        // 3. Bulk Delete it
        console.log('Testing Bulk Delete...');
        const deleteRes = await fetch(`${BASE_URL}/bulk-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: [createdProduct._id] })
        });

        if (!deleteRes.ok) {
            console.error('Bulk delete failed:', await deleteRes.text());
            return;
        }
        console.log('Bulk delete successful:', await deleteRes.json());

        // 4. Verify it's gone
        const checkRes = await fetch(`${BASE_URL}/${createdProduct._id}`);
        if (checkRes.status === 404) {
            console.log('Verification Passed: Product is gone.');
        } else {
            console.error('Verification Failed: Product still exists.');
        }

    } catch (error) {
        console.error('Verification Error:', error);
    }
}

verify();
