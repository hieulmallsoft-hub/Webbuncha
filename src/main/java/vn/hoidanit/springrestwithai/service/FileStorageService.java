package vn.hoidanit.springrestwithai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp");
    private static final int SIGNATURE_BYTES = 12;

    private final Path uploadPath;

    public FileStorageService(@Value("${app.upload.dir:./uploads}") String uploadDir) {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public String storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Vui long chon mot anh de tai len");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Chi chap nhan file anh");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String extension = extractExtension(originalFilename).toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Dinh dang anh chua duoc ho tro");
        }

        validateImageSignature(file, extension);

        String generatedFilename = UUID.randomUUID() + extension;
        Path targetFile = uploadPath.resolve(generatedFilename).normalize();
        if (!targetFile.startsWith(uploadPath)) {
            throw new IllegalArgumentException("Ten file anh khong hop le");
        }

        try {
            Files.createDirectories(uploadPath);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException exception) {
            throw new IllegalStateException("Khong the luu anh len may chu", exception);
        }

        return "/uploads/" + generatedFilename;
    }

    private String extractExtension(String filename) {
        int extensionIndex = filename.lastIndexOf('.');
        if (extensionIndex < 0 || extensionIndex == filename.length() - 1) {
            throw new IllegalArgumentException("Ten file anh khong hop le");
        }
        return filename.substring(extensionIndex);
    }

    private void validateImageSignature(MultipartFile file, String extension) {
        byte[] signature;
        try (InputStream inputStream = file.getInputStream()) {
            signature = inputStream.readNBytes(SIGNATURE_BYTES);
        } catch (IOException exception) {
            throw new IllegalStateException("Khong the doc anh tai len", exception);
        }

        boolean valid = switch (extension) {
            case ".jpg", ".jpeg" -> isJpeg(signature);
            case ".png" -> isPng(signature);
            case ".gif" -> isGif(signature);
            case ".webp" -> isWebp(signature);
            default -> false;
        };

        if (!valid) {
            throw new IllegalArgumentException("Noi dung file khong dung dinh dang anh");
        }
    }

    private boolean isJpeg(byte[] signature) {
        return signature.length >= 3
                && (signature[0] & 0xFF) == 0xFF
                && (signature[1] & 0xFF) == 0xD8
                && (signature[2] & 0xFF) == 0xFF;
    }

    private boolean isPng(byte[] signature) {
        return signature.length >= 8
                && (signature[0] & 0xFF) == 0x89
                && signature[1] == 0x50
                && signature[2] == 0x4E
                && signature[3] == 0x47
                && signature[4] == 0x0D
                && signature[5] == 0x0A
                && signature[6] == 0x1A
                && signature[7] == 0x0A;
    }

    private boolean isGif(byte[] signature) {
        return signature.length >= 6
                && signature[0] == 0x47
                && signature[1] == 0x49
                && signature[2] == 0x46
                && signature[3] == 0x38
                && (signature[4] == 0x37 || signature[4] == 0x39)
                && signature[5] == 0x61;
    }

    private boolean isWebp(byte[] signature) {
        return signature.length >= 12
                && signature[0] == 0x52
                && signature[1] == 0x49
                && signature[2] == 0x46
                && signature[3] == 0x46
                && signature[8] == 0x57
                && signature[9] == 0x45
                && signature[10] == 0x42
                && signature[11] == 0x50;
    }
}
