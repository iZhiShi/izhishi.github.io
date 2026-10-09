"""本地预览服务器：改完立刻能看到效果（no-cache 让浏览器每次向服务器核对，未变的文件返回 304），
同时监听 IPv4 + IPv6，避免 Safari 访问 localhost 时先试 ::1 再回退到 127.0.0.1 造成的卡顿。仅开发用，不影响线上。"""
import http.server, socket, socketserver

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

class DualStackServer(socketserver.ThreadingTCPServer):
    address_family = socket.AF_INET6
    allow_reuse_address = True
    daemon_threads = True
    def server_bind(self):
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        super().server_bind()

if __name__ == "__main__":
    with DualStackServer(("::", 8000), NoCacheHandler) as httpd:
        print("serving on http://localhost:8000")
        httpd.serve_forever()
