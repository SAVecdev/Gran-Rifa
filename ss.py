from datetime import datetime
from datetime import timedelta

'''
-- Desactivar el modo de actualización segura
SET SQL_SAFE_UPDATES = 0;
UPDATE estadistica ev
JOIN (
    SELECT user_id, SUM(total) as total_venta
    FROM tikets
    WHERE eliminado = 0
    GROUP BY user_id
) t ON ev.id = t.user_id
SET ev.Tventa = t.total_venta
WHERE ev.id = t.user_id;
UPDATE estadistica ev
JOIN (
    SELECT user_id, SUM(total) as total_venta
    FROM tikets
    WHERE eliminado = 0 AND fecha > CURDATE() - INTERVAL 8 DAY
    GROUP BY user_id
) t ON ev.id = t.user_id
SET ev.TvSemana = t.total_venta
WHERE ev.id = t.user_id;
UPDATE estadistica ev
JOIN(
    SELECT user_id, COUNT(id) as total_ventas
    FROM premios
    WHERE fecha = '2024-07-26'
    GROUP BY user_id
) t ON ev.id = t.user_id
SET ev.Pventa = t.total_ventas
WHERE ev.id = t.user_id;'''