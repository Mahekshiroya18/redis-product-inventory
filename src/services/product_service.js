
const Product = require("../models/product_model");
const { getRedisClient } = require("../config/redis");

const CACHE_TTL = 60;

async function runProductOperations() {
    const redis = getRedisClient();

    // 1. Validate an invalid product
    console.log("\n--- Invalid Product Validation ---");

    try {
        const invalidProduct = new Product({
            productId: "P99",
            name: "Invalid Product",
            category: "Electronics",
            price: -100,
            stock: 10,
            supplierCity: "Surat"
        });

        await invalidProduct.validate();
    } catch (error) {
        console.log("Validation error:", error.message);
        console.log("Invalid product inserted: false");
    }

    // 2. Insert five products
    console.log("\n--- Insert Products ---");

    const products = [
        { productId: "P01", name: "Keyboard", category: "Electronics", price: 1200, stock: 15, supplierCity: "Surat" },
        { productId: "P02", name: "Mouse", category: "Electronics", price: 650, stock: 5, supplierCity: "Ahmedabad" },
        { productId: "P03", name: "Notebook", category: "Stationery", price: 80, stock: 50, supplierCity: "Surat" },
        { productId: "P04", name: "Headphones", category: "Electronics", price: 1800, stock: 0, supplierCity: "Vadodara" },
        { productId: "P05", name: "Pen Set", category: "Stationery", price: 150, stock: 8, supplierCity: "Rajkot" }
    ];

    await Product.deleteMany({});
    await Product.insertMany(products);
    await redis.del("products:all");
    console.log("Five products inserted successfully.");

    // 3. Read all products using Redis cache
    console.log("\n--- All Products ---");

    let cachedProducts = await redis.get("products:all");

    if (cachedProducts) {
        console.log("Data loaded from Redis cache");
        console.table(JSON.parse(cachedProducts));
    } else {
        const allProducts = await Product.find().lean();
        await redis.set("products:all", JSON.stringify(allProducts), {
            EX: CACHE_TTL
        });
        console.log("Data loaded from MongoDB and cached in Redis");
        console.table(allProducts);
    }

    // 4. Read Electronics products
    console.log("\n--- Electronics Products ---");
    console.table(await Product.find({ category: "Electronics" }).lean());

    // 5. Read products priced <= 1000, sorted ascending
    console.log("\n--- Products Price <= 1000 (Ascending) ---");
    console.table(
        await Product.find({ price: { $lte: 1000 } })
            .sort({ price: 1 })
            .lean()
    );

    // 6. Update P02 price to 700
    console.log("\n--- Update P02 Price ---");
    await Product.updateOne(
        { productId: "P02" },
        { $set: { price: 700 } }
    );
    await redis.del("products:all");
    console.table(await Product.findOne({ productId: "P02" }).lean());

    // 7. Increase stock of all Stationery products by 10
    console.log("\n--- Increase Stationery Stock by 10 ---");
    const result = await Product.updateMany(
        { category: "Stationery" },
        { $inc: { stock: 10 } }
    );
    await redis.del("products:all");
    console.log("Stationery products updated:", result.modifiedCount);
    console.table(await Product.find({ category: "Stationery" }).lean());

    // 8. Delete P04 and verify
    console.log("\n--- Delete P04 ---");
    await Product.deleteOne({ productId: "P04" });
    await redis.del("products:all");

    const deletedProduct = await Product.findOne({ productId: "P04" });
    console.log("P04 still exists:", deletedProduct !== null);
}

module.exports = { runProductOperations };
