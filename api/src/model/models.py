# coding: utf-8
from sqlalchemy import Boolean, Column, Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
metadata = Base.metadata


class Banco(Base):
    __tablename__ = 'Banco'

    id_banco = Column(Integer, primary_key=True)
    descripcion = Column(String(200))
    ruc = Column(String(20))
    direccion = Column(String(100))


class Departamento(Base):
    __tablename__ = 'Departamento'

    id_departamento = Column(Integer, primary_key=True)
    descripcion = Column(String(100))


class Estado(Base):
    __tablename__ = 'Estado'

    id_estado = Column(Integer, primary_key=True)
    descripcion = Column(String(100), comment='Activa | No activa | Notificado | No notificado | Entregado | Pagado | bajo puerta | ...')
    tipo = Column(String(10))
    descripcionTipo = Column(String(100), comment='Papeleta | Resolucion | Notificacion')


class Infraccion(Base):
    __tablename__ = 'Infraccion'

    id_infraccion = Column(Integer, primary_key=True)
    codigo = Column(String(10), comment='Codigo de tipo de infraccion, ejemplo H-20')
    descripcion = Column(String(200))
    mto_multa = Column(Float)
    dias_descuento = Column(String(10))
    mto_multa_descuento = Column(Float)


class Levantamiento(Base):
    __tablename__ = 'Levantamiento'

    id_levantamiento = Column(Integer, primary_key=True)
    descripcion = Column(String(100))
    fec_emision_oficio = Column(Date)
    fec_notificacion_oficio = Column(Date)
    id_banco = Column(Integer)
    observaciones = Column(String(100))


class MesaParte(Base):
    __tablename__ = 'MesaPartes'

    id_mesa_partes = Column(Integer, primary_key=True)
    nro_expediente_tramite = Column(String(50))
    fec_presentada = Column(Date)
    sumilla_coactivo = Column(String(100))
    presenta_recurso = Column(String(100), comment='Persona que presenta el recurso (Nombres Abogada)')
    domicilio_procesal = Column(String(100))
    id_departamento = Column(Integer)
    folios = Column(String(100))


class Municipalidad(Base):
    __tablename__ = 'Municipalidad'

    id_municipalidad = Column(Integer, primary_key=True)
    descripcion = Column(String(200))


class Perfile(Base):
    __tablename__ = 'Perfiles'

    id_perfil = Column(Integer, primary_key=True)
    descripcion = Column(String)


class RetencionCuenta(Base):
    __tablename__ = 'Retencion_cuenta'

    id_retencion_cuenta = Column(Integer, primary_key=True)
    descripcion = Column(String(100))
    id_detalle_retencion = Column(Integer)


class TipoResolucion(Base):
    __tablename__ = 'TipoResolucion'

    id_tipo = Column(Integer, primary_key=True)
    descripcion = Column(String(100))
    observaciones = Column(String(200), nullable=False)


class Papeleta(Base):
    __tablename__ = 'Papeleta'

    id_papeleta = Column(Integer, primary_key=True)
    id_municipalidad = Column(Integer)
    nro_papeleta = Column(String(10))
    fec_captura = Column(Date)
    fec_notificacion = Column(Date)
    id_infraccion = Column(Integer)
    placa = Column(String(10))
    propietario = Column(String(200))
    dni = Column(String(15))
    razon_social = Column(String(15))
    ruc = Column(String(15))
    Importe = Column(Float)
    direccion = Column(String(200))
    id_distrito = Column(Integer)
    id_provincia = Column(Integer)
    id_departamento = Column(Integer)
    id_municipalidad_Municipalidad = Column(ForeignKey('Municipalidad.id_municipalidad', ondelete='SET NULL', onupdate='CASCADE', match='FULL'))
    id_infraccion_Infraccion = Column(ForeignKey('Infraccion.id_infraccion', ondelete='SET NULL', onupdate='CASCADE', match='FULL'))

    Infraccion = relationship('Infraccion')
    Municipalidad = relationship('Municipalidad')


class Provincia(Base):
    __tablename__ = 'Provincia'

    id_provincia = Column(Integer, primary_key=True)
    descripcion = Column(String(100))
    id_departamento = Column(Integer)
    id_departamento_Departamento = Column(ForeignKey('Departamento.id_departamento', ondelete='SET NULL', onupdate='CASCADE', match='FULL'))

    Departamento = relationship('Departamento')


class RespuestaBanco(Base):
    __tablename__ = 'Respuesta_Banco'

    id_respuesta_banco = Column(Integer, primary_key=True)
    descripcion = Column(String(100))
    fec_recepcion = Column(Date)
    fec_envio_respuesta = Column(Date)
    importe = Column(Float)
    nro_ingreso = Column(String(100))
    id_retencion_cuenta_Retencion_cuenta = Column(ForeignKey('Retencion_cuenta.id_retencion_cuenta', ondelete='SET NULL', onupdate='CASCADE', match='FULL'))

    Retencion_cuenta = relationship('RetencionCuenta')


class RetencionBanco(Base):
    __tablename__ = 'RetencionBanco'

    id_retencion_banco = Column(Integer, primary_key=True)
    descripcion = Column(String(100))
    fec_emision_oficio = Column(Date)
    fec_notificacion_oficio = Column(Date)
    id_banco = Column(Integer)
    id_retencion_cuenta_Retencion_cuenta = Column(ForeignKey('Retencion_cuenta.id_retencion_cuenta', ondelete='SET NULL', onupdate='CASCADE', match='FULL'))

    Retencion_cuenta = relationship('RetencionCuenta')


class Usuario(Base):
    __tablename__ = 'Usuario'

    id_usuario = Column(Integer, primary_key=True)
    descripcion = Column(String(10))
    nombres = Column(String(100))
    apellido_paterno = Column(String(100))
    apellido_materno = Column(String(100))
    correo = Column(String(100))
    sexo = Column(Boolean)
    id_estado = Column(Integer)
    id_perfil = Column(Integer)
    id_perfil_Perfiles = Column(ForeignKey('Perfiles.id_perfil', ondelete='SET NULL', onupdate='CASCADE', match='FULL'))

    Perfile = relationship('Perfile')


class DetalleRptaBanco(Base):
    __tablename__ = 'DetalleRptaBanco'

    id_detalleRptaBanco = Column(Integer, primary_key=True)
    descripcion = Column(String(100))
    id_respuesta_banco_Respuesta_Banco = Column(ForeignKey('Respuesta_Banco.id_respuesta_banco', ondelete='SET NULL', onupdate='CASCADE', match='FULL'))

    Respuesta_Banco = relationship('RespuestaBanco')


class Distrito(Base):
    __tablename__ = 'Distrito'

    id_distrito = Column(Integer, primary_key=True)
    descripcion = Column(String(10))
    id_provincia = Column(Integer)
    id_departamento = Column(Integer)
    id_provincia_Provincia = Column(ForeignKey('Provincia.id_provincia', ondelete='SET NULL', onupdate='CASCADE', match='FULL'))

    Provincia = relationship('Provincia')


class Resolucion(Base):
    __tablename__ = 'Resolucion'

    id_resolucion = Column(Integer, primary_key=True)
    nro_resolucion = Column(String(10))
    id_tipo = Column(Integer)
    anio = Column(String(10))
    siglica = Column(String(20))
    fec_emision_resolucion = Column(Date)
    fec_notificacion_resolucion = Column(Date)
    id_estado = Column(Integer)
    observaciones = Column(String(200))
    nueva_direccion = Column(String(200))
    pago_oportuno = Column(Float)
    id_banco = Column(Integer)
    id_papeleta_Papeleta = Column(ForeignKey('Papeleta.id_papeleta', ondelete='SET NULL', onupdate='CASCADE', match='FULL'), unique=True)
    id_tipo_TipoResolucion = Column(ForeignKey('TipoResolucion.id_tipo', ondelete='SET NULL', onupdate='CASCADE', match='FULL'))

    Papeleta = relationship('Papeleta', uselist=False)
    TipoResolucion = relationship('TipoResolucion')

class RC1(Base):
    __tablename__ = 'RC1'

    id_rc1 = Column(Integer, primary_key=True)
    nro_rc1 = Column(String(100))
    fec_emision_rc1 = Column(Date)
    fec_notificacion_RC1 = Column(Date)
    id_estado = Column(Integer)
    nro_informe = Column(String(50))
    fec_informe = Column(Date)
    nro_constancia_exigibilidad = Column(String(50))
    fec_constancia_exigibilidad = Column(Date)
    costas_gastos_RC1 = Column(Float)
    costas_rc2 = Column(Float)
    gastos_rc2 = Column(Float)
    costas_retencion = Column(Float)
    total_pagar_rc2 = Column(Float)
    rc1_cancelacion_mto = Column(Float)
    fec_pago = Column(Date)
    id_banco = Column(Integer)
    id_resolucion_Resolucion = Column(ForeignKey('Resolucion.id_resolucion', ondelete='SET NULL', onupdate='CASCADE', match='FULL'), unique=True)

    Resolucion = relationship('Resolucion', uselist=False)


class RC2(Base):
    __tablename__ = 'RC2'

    id_rc2 = Column(Integer, primary_key=True)
    nro_rc2 = Column(String(100))
    descripcion_rc2 = Column(String(100))
    fec_emision_rc2 = Column(Date)
    fec_notificacion_rc2 = Column(Date)
    mto_pagado = Column(Float)
    fec_pago = Column(Date)
    id_banco = Column(Integer)
    id_rc1_RC1 = Column(ForeignKey('RC1.id_rc1', ondelete='SET NULL', onupdate='CASCADE', match='FULL'), unique=True)

    RC1 = relationship('RC1', uselist=False)


class RC3(Base):
    __tablename__ = 'RC3'

    id_rc3 = Column(Integer, primary_key=True)
    nro_rc3 = Column(String(50))
    descripcion_rc3 = Column(String(100))
    fec_emision_rc3 = Column(Date)
    fec_notificacion_rc3 = Column(Date)
    nro_oficio_giro_cheque = Column(String(50))
    fec_emision_oficio_giro = Column(Date)
    fec_notificacion_oficio_giro = Column(Date)
    nro_cheque = Column(String(50))
    fec_cheque = Column(Date)
    id_banco = Column(Integer)
    mto_cheque = Column(Float)
    nro_formato = Column(String(50))
    fec_recojo_cheque = Column(Date)
    persona_recojo_cheque = Column(String(100))
    id_rc2_RC2 = Column(ForeignKey('RC2.id_rc2', ondelete='SET NULL', onupdate='CASCADE', match='FULL'), unique=True)

    RC2 = relationship('RC2', uselist=False)


class RC4(Base):
    __tablename__ = 'RC4'

    id_rc4 = Column(Integer, primary_key=True)
    descripcion = Column(String(100))
    fec_emision_rc4 = Column(Date)
    fec_notificacion_rc4 = Column(Date)
    observaciones = Column(String(100))
    id_rc3_RC3 = Column(ForeignKey('RC3.id_rc3', ondelete='SET NULL', onupdate='CASCADE', match='FULL'), unique=True)

    RC3 = relationship('RC3', uselist=False)


class RC5(Base):
    __tablename__ = 'RC5'

    id_rc5 = Column(Integer, primary_key=True)
    nro_rc5 = Column(String(50))
    descripcion_RC5 = Column(String(100))
    fec_emision_rc5 = Column(Date)
    fec_notificacion_rc5 = Column(Date)
    notificacion_mail = Column(String(100))
    fec_envio_notificacion_mail = Column(Date)
    id_usuario = Column(Integer, comment='Usuario que notifica vÝa mail')
    id_estado = Column(Integer)
    id_rc4_RC4 = Column(ForeignKey('RC4.id_rc4', ondelete='SET NULL', onupdate='CASCADE', match='FULL'), unique=True)

    RC4 = relationship('RC4', uselist=False)
