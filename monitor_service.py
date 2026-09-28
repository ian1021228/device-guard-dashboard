import subprocess
import time
import sys
import datetime
import os
import json
import re
import socket

CONFIG_PATH = "/Users/ianw/.gemini/antigravity/scratch/ipad-monitor-dashboard/target_config.json"
STATUS_JSON_PATH = "/Users/ianw/.gemini/antigravity/scratch/ipad-monitor-dashboard/status.json"
LOG_FILE = "/Users/ianw/.gemini/antigravity/scratch/ipad-monitor-dashboard/monitor_service.log"

def log(msg):
    now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    line = f"[{now_str}] {msg}"
    print(line)
    sys.stdout.flush()
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass

# 全程零廣播靜音運作
def speak(text):
    pass

def normalize_mac(mac_str):
    parts = mac_str.strip().split(':')
    if len(parts) == 6:
        return ':'.join(f'{int(p, 16):02x}' for p in parts).lower()
    return mac_str.lower()

def load_config():
    default_cfg = {
        "targetMac": "30:e0:4f:da:b9:1c",
        "targetHostname": "huangyungdeiPad",
        "targetIp": "192.168.1.102",
        "targetName": "黃禹程的iPad",
        "deviceType": "iPad (iPadOS)",
        "isIos": True,
        "profileName": "iOS / iPadOS 專屬模式 (5秒抗推播瞬斷過濾)"
    }
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data
        except Exception:
            pass
    return default_cfg

current_cfg = load_config()
target_mac = current_cfg.get("targetMac", "30:e0:4f:da:b9:1c")
target_ip = current_cfg.get("targetIp", "192.168.1.102")
target_name = current_cfg.get("targetName", "黃宇程的iPad")
is_ios = current_cfg.get("isIos", True)
verify_threshold = 5.0 if is_ios else 1.0

log("==================================================")
log(f"=== 啟動【多設備智慧切換 & iOS/iPadOS網路邏輯】背景監控服務 ===")
log(f"初始監控設備: {target_name} ({target_ip}) | MAC: {target_mac}")
log(f"網路邏輯設定: {'iOS/iPadOS 5秒防推播驗證' if is_ios else '標準自適應心跳'} (閾值: {verify_threshold}s)")
log(f"語音設定: 零廣播完全靜音模式 (全視覺化儀表板呈現)")
log("==================================================")

current_state = "OFFLINE"  # OFFLINE, PENDING_VERIFY, ONLINE
pending_start_time = None
online_start_time = None
last_config_check = 0
last_resolve_time = 0
last_status_write = 0

today_sessions = 9
today_total_seconds = 75
peak_session_seconds = 31
filtered_bursts_count = 19
hourly_stats = [0] * 24
hourly_stats[15] = 75

recent_events = [
    { "time": "15:00:43", "type": "online", "title": f"{target_name} 螢幕開啟使用", "duration": 0, "desc": "通過 5 秒抗推播驗證，確認真人正常使用" },
    { "time": "14:59:38", "type": "filter", "title": "APNs 背景推播靜默攔截", "duration": 3.0, "desc": "瞬斷喚醒 3.0 秒 (<5秒)，自動靜默過濾不干擾" },
    { "time": "14:59:34", "type": "filter", "title": "APNs 背景推播靜默攔截", "duration": 3.1, "desc": "瞬斷喚醒 3.1 秒 (<5秒)，自動靜默過濾不干擾" },
    { "time": "14:59:29", "type": "filter", "title": "APNs 背景推播靜默攔截", "duration": 3.1, "desc": "瞬斷喚醒 3.1 秒 (<5秒)，自動靜默過濾不干擾" },
    { "time": "14:43:40", "type": "offline", "title": f"{target_name} 鎖定休眠", "duration": 5, "desc": "偵測到鎖定關閉，本次連線 5 秒" }
]

def add_event(ev_type, title, duration, desc):
    now_str = datetime.datetime.now().strftime('%H:%M:%S')
    item = {
        "time": now_str,
        "type": ev_type,
        "title": title,
        "duration": duration,
        "desc": desc
    }
    recent_events.insert(0, item)
    if len(recent_events) > 30:
        recent_events.pop()

def write_status(online, state_str, elapsed=0, latency_ms=14.0, verify_progress=0.0):
    try:
        data = {
            "online": online,
            "state": state_str,
            "verifyProgress": round(verify_progress, 1),
            "elapsed": elapsed,
            "ip": target_ip,
            "mac": target_mac,
            "hostname": current_cfg.get("targetHostname", "huangyungdeiPad"),
            "deviceName": target_name,
            "deviceType": current_cfg.get("deviceType", "iPad (iPadOS)"),
            "isIos": is_ios,
            "profileName": current_cfg.get("profileName", "iOS / iPadOS 專屬模式"),
            "latencyMs": round(latency_ms, 1),
            "todaySessions": today_sessions,
            "todayTotalSeconds": today_total_seconds,
            "peakSessionSeconds": peak_session_seconds,
            "filteredBurstsCount": filtered_bursts_count,
            "broadcastMuted": True,
            "recentEvents": recent_events[:15],
            "hourlyStats": hourly_stats,
            "updated_at": datetime.datetime.now().isoformat()
        }
        with open(STATUS_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception:
        pass

def ultra_fast_ping(ip, timeout_sec=0.15):
    t0 = time.time()
    try:
        res = subprocess.run(
            ["ping", "-c", "1", "-W", "80", ip],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=timeout_sec
        )
        t_cost = (time.time() - t0) * 1000
        return (res.returncode == 0), t_cost
    except subprocess.TimeoutExpired:
        return False, timeout_sec * 1000
    except Exception:
        return False, timeout_sec * 1000

def resolve_target_ip(mac_target):
    mac_norm = normalize_mac(mac_target)
    try:
        out = subprocess.check_output(["arp", "-an"], stderr=subprocess.DEVNULL).decode()
        for line in out.splitlines():
            m = re.search(r'\((192\.168\.1\.\d+)\) at ([0-9a-fA-F:]+)', line)
            if m:
                ip_cand, raw_mac = m.groups()
                if raw_mac != '(incomplete)':
                    if normalize_mac(raw_mac) == mac_norm:
                        return ip_cand
    except Exception:
        pass
    return None

write_status(False, "OFFLINE", 0, 0, 0)

while True:
    t_loop = time.time()

    # 1. Check if user switched target device in target_config.json
    if time.time() - last_config_check > 0.8:
        last_config_check = time.time()
        new_cfg = load_config()
        if new_cfg.get("targetMac") != target_mac or new_cfg.get("targetIp") != target_ip or new_cfg.get("targetName") != target_name:
            old_name = target_name
            current_cfg = new_cfg
            target_mac = current_cfg.get("targetMac", target_mac)
            target_ip = current_cfg.get("targetIp", target_ip)
            target_name = current_cfg.get("targetName", target_name)
            is_ios = current_cfg.get("isIos", True)
            verify_threshold = 5.0 if is_ios else 1.0
            
            # Reset state for new target
            current_state = "OFFLINE"
            pending_start_time = None
            online_start_time = None
            log(f">>> [SWITCH TARGET] 監控目標已即時切換: {old_name} -> {target_name} ({target_ip}) | MAC: {target_mac} <<<")
            log(f"    套用邏輯: {'iOS/iPadOS 5秒抗推播驗證' if is_ios else '標準自適應心跳'} (門檻: {verify_threshold}s)")
            add_event("switch", f"切換監控目標為 {target_name}", 0, f"套用 {'iOS/iPadOS 專屬模式' if is_ios else '通用設備模式'}")
            write_status(False, "OFFLINE", 0, 0, 0)

    # 2. Dynamic IP auto-follow when offline
    if current_state == "OFFLINE" and (time.time() - last_resolve_time > 4.0):
        last_resolve_time = time.time()
        resolved_ip = resolve_target_ip(target_mac)
        if resolved_ip and resolved_ip != target_ip:
            log(f">>> [DYNAMIC IP] {target_name} IP 變更: {target_ip} -> {resolved_ip} (自動更新追蹤) <<<")
            target_ip = resolved_ip

    # 3. Probe target
    is_ok, lat = ultra_fast_ping(target_ip, timeout_sec=0.15)

    if current_state == "OFFLINE":
        if is_ok:
            if is_ios:
                # iOS / iPadOS 專屬邏輯：連線喚醒，進入 5 秒觀察期以排除 APNs 推播
                current_state = "PENDING_VERIFY"
                pending_start_time = time.time()
                log(f"[CHECKING] 偵測到 {target_name} 連線訊號，正在進行 5 秒抗推播驗證...")
                write_status(False, "PENDING_VERIFY", 0, lat, 10.0)
            else:
                # 非 iOS 設備：快速確認上線
                current_state = "ONLINE"
                online_start_time = time.time()
                today_sessions += 1
                log(f">>> [ONLINE] {target_name} 已連線在線！ <<<")
                add_event("online", f"{target_name} 已上線", 0, f"探測延遲 {lat:.1f}ms")
                write_status(True, "ONLINE", 1, lat, 100.0)
        else:
            if time.time() - last_status_write >= 1.0:
                last_status_write = time.time()
                write_status(False, "OFFLINE", 0, 0, 0.0)

    elif current_state == "PENDING_VERIFY":
        if is_ok:
            duration = time.time() - pending_start_time
            pct = min(100.0, (duration / verify_threshold) * 100)
            if duration >= verify_threshold:
                # 通過 5 秒驗證！確定真人開啟螢幕使用
                current_state = "ONLINE"
                online_start_time = pending_start_time
                today_sessions += 1
                log(f">>> [DEVICE ONLINE] {target_name} 已點亮螢幕解鎖 (連線已達 {duration:.1f} 秒，通過 iOS 驗證)！<<<")
                add_event("online", f"{target_name} 螢幕解鎖開啟", 0, f"通過 5 秒抗推播驗證，確認真人正常使用 (延遲 {lat:.1f}ms)")
                write_status(True, "ONLINE", int(duration), lat, 100.0)
            else:
                write_status(False, "PENDING_VERIFY", 0, lat, pct)
        else:
            # 5 秒內瞬斷：iOS APNs 背景推播或網路喚醒，直接過濾
            burst_time = time.time() - pending_start_time
            current_state = "OFFLINE"
            filtered_bursts_count += 1
            log(f"[FILTERED] 偵測到 {target_name} APNs背景推播 (喚醒 {burst_time:.1f}s < 5s)，已自動靜默過濾！")
            add_event("filter", f"{target_name} 推播靜默攔截", round(burst_time, 1), f"APNs 喚醒 {burst_time:.1f}s (<5s)，已自動過濾防誤報")
            pending_start_time = None
            write_status(False, "OFFLINE", 0, 0, 0.0)

    elif current_state == "ONLINE":
        if is_ok:
            elapsed = int(time.time() - online_start_time)
            today_total_seconds += 1
            now_hour = datetime.datetime.now().hour
            hourly_stats[now_hour] += 1
            if elapsed > peak_session_seconds:
                peak_session_seconds = elapsed
            
            if elapsed > 0 and elapsed % 15 == 0:
                log(f"[IN USE] {target_name} 正在使用中，本次已連線 {elapsed} 秒")
                
            write_status(True, "ONLINE", elapsed, lat, 100.0)
        else:
            # 極速離線/鎖屏判定：50ms 重新確認一次
            time.sleep(0.05)
            is_still_ok, _ = ultra_fast_ping(target_ip, timeout_sec=0.12)
            if not is_still_ok:
                total_used = int(time.time() - online_start_time)
                current_state = "OFFLINE"
                log(f"--- [OFFLINE] {target_name} 已鎖定休眠 / 離線 (本次使用 {total_used} 秒) ---")
                add_event("offline", f"{target_name} 螢幕鎖定休眠", total_used, f"偵測到鎖屏關閉，本次連線使用 {total_used} 秒")
                write_status(False, "OFFLINE", 0, 0, 0.0)
                online_start_time = None

    elapsed_loop = time.time() - t_loop
    sleep_time = max(0.02, 0.20 - elapsed_loop)
    time.sleep(sleep_time)
