package vn.hoidanit.springrestwithai.config;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import vn.hoidanit.springrestwithai.model.Category;
import vn.hoidanit.springrestwithai.model.Product;
import vn.hoidanit.springrestwithai.repository.CategoryRepository;
import vn.hoidanit.springrestwithai.repository.ProductRepository;

@Component
@Profile("local")
public class LocalMenuSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Value("${app.demo-menu.enabled:true}")
    private boolean demoMenuEnabled;

    public LocalMenuSeeder(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        if (!demoMenuEnabled || productRepository.count() > 0) {
            return;
        }

        Category bunCha = findOrCreateCategory(
                "Bún chả",
                "Những món bún chả nướng than hoa theo phong cách Chinh Hương.",
                "/images/z7699820424452_f8d7ab08e70eeb92e0f51c7d1a7c1b76.jpg");
        Category monKem = findOrCreateCategory(
                "Món kèm",
                "Các món ăn kèm giúp bữa bún chả trọn vị hơn.",
                "/images/z7699818623770_8a62f4a85b03b59c3ced823381b7ec55.jpg");

        List.of(
                product("Bún chả viên", "Chả viên nướng thơm, bún rối, rau sống và nước chấm.", "6.00",
                        "/images/z7699819283762_3634071596ff124321b8dd68e057bc54.jpg", bunCha),
                product("Bún chả lẫn", "Kết hợp chả viên và thịt nướng, ăn kèm dưa góp.", "7.00",
                        "/images/z7699819298138_5ea6bacf9d760fe5a02bd43fc7c1569b.jpg", bunCha),
                product("Bún chả thịt nướng", "Thịt nướng vàng cạnh, thơm khói than, nước chấm chuẩn vị.", "7.50",
                        "/images/z7699827552354_755b5c69c8b1297ef9a1201caf3b50cc.jpg", bunCha),
                product("Nem rán", "Nem vàng giòn, nhân thịt mộc nhĩ, chấm nước mắm.", "3.50",
                        "/images/z7699818623770_8a62f4a85b03b59c3ced823381b7ec55.jpg", monKem),
                product("Bánh bột lọc", "Bánh bột lọc dẻo, nhân đậm vị, chấm nước mắm.", "3.00",
                        "/images/z7699818644305_2d4593c168855b379e693ea8a463137d.jpg", monKem),
                product("Thịt chưng mắm tép", "Thịt băm rim mắm tép, đậm đà, dùng kèm bún.", "4.00",
                        "/images/z7699824400807_26c95d3e093e254fd8184f5919f2cab4.jpg", monKem))
                .forEach(productRepository::save);
    }

    private Category findOrCreateCategory(String name, String description, String imageUrl) {
        return categoryRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> {
                    Category category = new Category();
                    category.setName(name);
                    category.setDescription(description);
                    category.setImageUrl(imageUrl);
                    return categoryRepository.save(category);
                });
    }

    private Product product(String name, String description, String price, String imageUrl, Category category) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(new BigDecimal(price));
        product.setImageUrl(imageUrl);
        product.setCategory(category);
        return product;
    }
}
