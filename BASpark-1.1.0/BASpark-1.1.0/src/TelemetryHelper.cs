using System;

namespace BASpark
{
    public static class TelemetryHelper
    {
        public static void SendStartupData()
        {
            if (!ConfigManager.EnableTelemetry) return;
            // 当前版本暂不收集任何用户数据 >264100
            return;
        }
    }
}