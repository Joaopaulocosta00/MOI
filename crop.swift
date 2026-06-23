import Foundation
import Cocoa

let imagePath = "/Users/joaopaulocosta/Desktop/moi-website/assets/logo/logo-nova.png"
guard let image = NSImage(contentsOfFile: imagePath) else {
    print("Could not load image")
    exit(1)
}

var rect = CGRect(x: 0, y: 0, width: image.size.width, height: image.size.height)
guard let cgImage = image.cgImage(forProposedRect: &rect, context: nil, hints: nil) else {
    print("Could not get cgImage")
    exit(1)
}

// Crop 80 pixels from the right and 80 pixels from the bottom
let cropRect = CGRect(x: 0, y: 0, width: cgImage.width - 120, height: cgImage.height - 120)
guard let cropped = cgImage.cropping(to: cropRect) else {
    print("Could not crop")
    exit(1)
}

let newRep = NSBitmapImageRep(cgImage: cropped)
guard let pngData = newRep.representation(using: .png, properties: [:]) else {
    print("Could not generate png")
    exit(1)
}

do {
    try pngData.write(to: URL(fileURLWithPath: imagePath))
    print("Success")
} catch {
    print("Error saving: \(error)")
}
