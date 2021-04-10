# -*- coding: utf-8 -*-
import datetime as dt
import logging
import inspect
import re
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, OperationalError
from sqlalchemy import func, inspect as inspect_sqlalch
from sqlalchemy import between
from sqlalchemy import desc
from sqlalchemy.orm import load_only
from sqlalchemy.orm import class_mapper
from decimal import Decimal
from sqlalchemy.ext.declarative import declarative_base
from . import ControllerError
Base = declarative_base()


def get_fields(cols, model):
    return [model.__dict__[k] for k in cols]


def get_columns_sqlalch(model):
    return model.__table__.columns.keys()


def show_query(query):
    logging.debug(str(query.statement.compile()))


def dict_sqlalch(alch_object):
    if hasattr(alch_object, '__dict__'):
        return alch_object.__dict__
    elif hasattr(alch_object, '_asdict'):
        return alch_object._asdict()


def qf_sqlalch(alch_object):
    return formatting_dict(dict_sqlalch(alch_object))


def formatting_dict(dictio):
    if dictio is None:
        return None
    dictio.pop('_sa_instance_state', None)
    for keys in dictio:
        tipo = type(dictio[keys])
        if tipo is dt.date:
            date = dictio[keys]
            string_date = date.strftime('%Y-%m-%d')
            dictio[keys] = string_date
        elif tipo is dt.datetime:
            date = dictio[keys]
            string_date = date.strftime('%Y-%m-%d %H:%M:%S')
            dictio[keys] = string_date
        elif tipo is dt.time:
            date = dictio[keys]
            string_date = date.strftime('%H:%M:%S')
            dictio[keys] = string_date
        elif isinstance(dictio[keys], Decimal):
            dictio[keys] = float(dictio[keys])
    return dictio


def sqlalch_wrapper(sqlalch):
    def decorator(function):
        def wrapper(*args, **kwargs):
            session = sqlalch()  # Scoped session
            try:
                return function(session, *args, **kwargs)  # Wrapper
            except IntegrityError as error:
                logging.exception("SQLAlchemyIntegrityError: "+str(error))
                session.rollback()
                session.close()
                return {'error': True, 'msg': "SQLAlchemyError: Hay problemas con la integridad de datos, revisa los logs", 'in_error': True}
            except OperationalError as error:
                logging.exception("SQLAlchemyOperationalError: "+str(error))
                session.rollback()
                session.close()
                return {'error': True, 'msg': str(error), 'op_error': True}
            except SQLAlchemyError as error:
                logging.exception("SQLAlchemyError: "+str(error))
                session.rollback()
                session.close()
                return {'error': True, 'msg': str(error)}
            # future improvement
            except ControllerError as error:
                logging.debug("ControllerError: "+str(error))
                size_error = error.args.__len__()
                if (size_error == 1):
                    return {'error': True, 'msg': str(error)}
                elif(size_error > 1):
                    return {'error': True, 'msg': str(error.args[0]), 'data': error.args[1]}
            except Exception as error:
                logging.exception("Uncontrolled Error: "+str(error))
                session.rollback()
                session.close()
                return {'error': True, 'msg': str(error)}
            finally:
                session.close()
        return wrapper
    return decorator


def get_max_value_sqlalch(s, field):
    return s.query(func.max(field)).scalar()


def get_primary_keys_sqlalch(model):
    primary_keys = set([p.name for p in inspect_sqlalch(model).primary_key])
    return primary_keys


def get_primary_keys_sqlalch_mapper(model):
    return [key.name for key in class_mapper(model).primary_key]


def get_all_with_fields(s, model, fields):
    s.query(model).options(load_only(*fields)).all()


def get_prefix_fields_sqlalch(cols, model, prefix):
    return [model.__dict__[k].label(prefix+k) for k in cols]


def get_fields_sqlalch(cols, model):
    return [model.__dict__[k] for k in cols]


def get_filter_fields_sqlalch_old(dictionary_filter: dict, model: Base):
    return {model.__dict__[k]: dictionary_filter[k] for k in dictionary_filter}


def get_filter_fields_sqlalch(dictionary_filter: dict, model: Base):
    return tuple([model.__dict__[k] == dictionary_filter[k] for k in dictionary_filter])


def get_filter_fields_multi_sqlalch(dictionary_filter: dict, model: Base):
    filters = list()
    for k, v in dictionary_filter.items():
        if k in model.__dict__:
            logging.debug(v)
            if isinstance(v, list) and len(v) > 1:
                filters.append(model.__dict__[k].in_(v))
            elif isinstance(v, list) and len(v) == 1:
                filters.append(model.__dict__[k] == v[0])
            elif v == 'null':
                filters.append(model.__dict__[k] == None)
            elif isinstance(v, str) and re.search(r'<>', v):
                filters.append(model.__dict__[k].between(
                    v.split('<>')[0], v.split('<>')[1]))
            elif isinstance(v, str) and re.search(r'<=', v):
                filters.append(model.__dict__[k] <= re.sub(
                    r'<=', '', dictionary_filter[k]))
            elif isinstance(v, str) and re.search(r'<', v):
                filters.append(model.__dict__[k] < re.sub(
                    r'<', '', dictionary_filter[k]))
            elif isinstance(v, str) and re.search(r'>=', v):
                filters.append(model.__dict__[k] >= re.sub(
                    r'>=', '', dictionary_filter[k]))
            elif isinstance(v, str) and re.search(r'>', v):
                filters.append(model.__dict__[k] > re.sub(
                    r'>', '', dictionary_filter[k]))
            else:
                filters.append(model.__dict__[k] == dictionary_filter[k])
    logging.debug(filters)
    return tuple(filters)


def get_order_fields_multi_sqlalch(list_order: list, model: Base):
    orders = list()
    for o in list_order:
        logging.debug(o)
        if re.sub(r'>', '', o) in model.__dict__:
            orders.append(desc(model.__dict__[re.sub(r'>', '', o)]))
        elif re.sub(r'<', '', o) in model.__dict__:
            orders.append(model.__dict__[re.sub(r'<', '', o)])
    logging.debug(orders)
    return tuple(orders)


def filter_fields_sqlalch(dictionary_object, fields):
    return {x: dictionary_object.get(x) for x in fields}

#----- revisar


def sqlaPurge(s):
    s.rollback()
    s.close()


def quick_format_sqlalch(alch_object):
    return format_dict_sqlalch(dict_sqlalch(alch_object))


def qf_sqlalch(alch_object):
    return format_dict_sqlalch(dict_sqlalch(alch_object))


def format_dict_sqlalch(dictio):
    if dictio is None:
        return None
    dictio = dictio.copy()
    dictio.pop('_sa_instance_state', None)
    for keys in dictio:
        typ = type(dictio[keys])
        # logging.debug("Keys of dictio: "+str(keys))
        if typ is dt.date:
            date = dictio[keys]
            string_date = date.strftime('%Y-%m-%d')
            dictio[keys] = string_date
        elif typ is dt.datetime:
            date = dictio[keys]
            string_date = date.strftime('%Y-%m-%d %H:%M:%S')
            dictio[keys] = string_date
        elif typ is dt.time:
            date = dictio[keys]
            string_date = date.strftime('%H:%M:%S')
            dictio[keys] = string_date
        if dictio[keys] is None:
            dictio[keys] = "No Data"
    return dictio


def filter_fields_sqlalch(dictionary_object, fields):
    return {x: dictionary_object.get(x) for x in fields}


def remove_fields_sqlalch(dictionary_object, fields):
    return {k: v for k, v in dictionary_object.items() if k not in fields}

def remove_none_fields_sqlalch(dictionary_object):
    return {k: v for k, v in dictionary_object.items() if v is not None}
