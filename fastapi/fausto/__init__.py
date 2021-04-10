# -*- coding: utf-8 -*-
import os
import json
import hashlib
import traceback
from datetime import datetime, timedelta
import logging



class ValidateResult():
    def __init__(self, ok: bool, msg: str, data: dict = None, filtered: dict = None):
        self.ok = ok
        self.msg = msg
        self.data = data
        self.filtered = filtered


def validate_required_data(json_dict: dict = {}, keys: dict = {}, optional_keys: dict = {}):
    msg = "La data json enviada está bien"
    ok = True
    try:
        faltantes = [x for x in keys if x not in json_dict.keys(
        ) or json_dict.get(x) == None or json_dict.get(x) == ""]
        sobrantes = [x for x in json_dict.keys(
        ) if x not in keys and x not in optional_keys]
        if len(faltantes) > 0 or len(sobrantes) > 0:
            msg = f'data json faltantes: {", ".join(faltantes)}; Sobrantes: {", ".join(sobrantes)}'
            ok = False
    except Exception:
        logging.exception("Error fatal en validate_required_data")
        msg = "SE PRODUJO UN ERROR EN LA FUNCTION validate_required_data"
        ok = False
    return ValidateResult(ok=ok, msg=msg, data={'required': faltantes, 'leftover': sobrantes})


def validate_required_args(json_dict: dict = {}, keys: dict = {}, required: bool = False):
    msg = "Los argumentos están bien"
    ok = True
    logging.debug(json_dict)
    try:
        if json_dict is None or len(json_dict) == 0:
            ok = False
            msg = "No hay argumentos"
        faltantes = [x for x in keys if x not in json_dict.keys(
        ) or json_dict.get(x) == None or json_dict.get(x) == ""]
        sobrantes = [x for x in json_dict.keys() if x not in keys]
        filtrados = {x: json_dict.get(x) for x in json_dict.keys(
        ) if x in keys and json_dict.get(x) and json_dict.get(x) != ""}
        logging.debug(
            f"args faltantes: {faltantes}; args sobrantes: {sobrantes}; args filtered: {filtrados}")
        if required and len(faltantes) > 0:
            msg = f"args faltantes: {faltantes}; args sobrantes: {sobrantes}"
            ok = False
        if len(sobrantes) > 0:
            msg = f"args faltantes: {faltantes}; args sobrantes: {sobrantes}"
            ok = False
    except Exception:
        logging.exception("Error fatal en validate_requiredargs")
        msg = "SE PRODUJO UN ERROR EN LA FUNCTION validate_required_args"
        ok = False
    return ValidateResult(ok=ok, msg=msg, data={'required': faltantes, 'leftover': sobrantes}, filtered=filtrados)


def depure_args_with_list(args):
    # def isfloat(value):
    #     try:
    #         float(value)
    #         return True
    #     except ValueError:
    #         return False
    def list_depure(x):
        result = x[0] if len(x) == 1 else x
        if result in ('True', 'true'):
            result = True
        elif result in ('False', 'false'):
            result = False
        # elif result.isnumeric():
        #     result = int(result)
        # elif isfloat(result):
        #     result = float(result)
        return result
    args = args.to_dict(flat=False)
    result = {k: list_depure(args.get(k)) for k in args}
    return result


def args_parser(args):
    def list_depure(x):
        result = x[0] if len(x) == 1 else list(set(x))
        if result in ('True', 'true'):
            result = True
        elif result in ('False', 'false'):
            result = False
        return result
    args = args.to_dict(flat=False)
    result = {k: list_depure(args.get(k)) for k in args}
    return result


def tryWrapper(function):
    def wrapper(*args, **kwargs):
        try:
            data = "Data not found!"
            response = function(*args, **kwargs)
            if type(response) is tuple:
                msg, data = response
            else:
                msg = response
            return {"msg": msg, "data": data, "error": False}
        except ControllerError as error:
            size_error = error.args.__len__()
            if (size_error == 1):
                raise HTTPException(status_code=500, detail={
                                    "msg": str(error), "data": None, "error": True})
            elif(size_error > 1):
                raise HTTPException(status_code=500, detail={
                                    "msg": str(error.args[0]), "data": error.args[1], "error": True})
        except Exception as error:
            logging.error(
                "#----------------->ERROR de tryWrapper <----------------------#")
            logging.debug(traceback.format_exc())
            return {"msg": str(error), "data": data, "error": True}
    return wrapper





class ControllerError(Exception):
    pass
