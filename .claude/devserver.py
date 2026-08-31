"""本地预览服务器：禁用缓存，便于改完立刻看到效果。仅开发用，不影响线上。"""
import functools, http.server, socketserver

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", 8000), NoCacheHandler) as httpd:
        print("serving on http://localhost:8000")
        httpd.serve_forever()
