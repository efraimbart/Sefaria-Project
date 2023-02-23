from datetime import date

def get_today_weekday():
    today = date.today()
    weekday_num = today.isoweekday() # 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
    weekday_name = today.strftime("%A") # "Monday", "Tuesday", ..., "Sunday"
    return weekday_num, weekday_name
