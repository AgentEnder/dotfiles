import AppKit
let a = CommandLine.arguments
guard a.count == 3, let img = NSImage(contentsOfFile: a[1]) else {
    FileHandle.standardError.write("usage: seticon <icon.icns> <target>\n".data(using: .utf8)!); exit(1)
}
guard NSWorkspace.shared.setIcon(img, forFile: a[2], options: []) else {
    FileHandle.standardError.write("setIcon failed\n".data(using: .utf8)!); exit(1)
}
