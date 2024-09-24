import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma.service';
import { uploadFile, deleteFile } from '../helpers/UploadFile';
import { Prisma } from '@prisma/client';

@Injectable()
export class ApplicationService {
  constructor(private readonly prisma: PrismaService) { }

  async createApplication(req: any, res: any, next: any) {
    try {
      const destination = await this.prisma.destination.findUnique({
        where: { id: req.body.destination },
        include: { requirements: true },
      });

      if (!destination) {
        throw new HttpException('Destination not found', HttpStatus.BAD_REQUEST);
      }

      const requirements = destination.requirements.map((req) => req.name);

      const docsIds = await Promise.all(
        Object.keys(req.files).map(async (name) => {
          const documentFile = req.files[name];
          const extension = documentFile.mimetype.split('/')[1];
          documentFile.name = `${name}-${destination.name}-${req.user.lastname}.${extension}`;

          let newDocumentPath;
          if (extension === 'png') {
            newDocumentPath = await uploadFile(
              `public/applications/${destination.name}${req.body.nbVisit}-${req.user.firstname}${req.user.lastname}`,
              documentFile,
              'image',
            );
          } else {
            newDocumentPath = await uploadFile(
              `public/applications/${destination.name}${req.body.nbVisit}-${req.user.firstname}${req.user.lastname}`,
              documentFile,
              'file',
            );
          }

          if (newDocumentPath !== 'error') {
            const typeDocument = await this.prisma.typeDocument.findFirst({
              where: { name },
            });

            if (!typeDocument) {
              throw new Error(`TypeDocument with name ${name} not found`);
            }

            const document = await this.prisma.document.create({
              data: {
                path: newDocumentPath,
                typeId: typeDocument.id,
                applicationId: 12
              },
              select: { id: true, path: true }, // Select only the fields you need
            });

            return document.id;

          } else {
            throw new Error('Failed to upload document');
          }
        }),
      );

      const newApplication = await this.prisma.application.create({
        data: {
          destinationId: req.body.destination,
          travelerId: req.user.id,
          directory: `${destination.name}${req.body.nbVisit}`,
          documents: {
            connect: docsIds.map((id) => ({ id })),
          },
        },
      });

      await this.prisma.user.update({
        where: { id: req.user.id },
        data: {
          applications: {
            connect: { id: newApplication.id },
          },
        },
      });

      return res.status(201).send({ data: newApplication });
    } catch (ex) {
      next(ex);
    }
  }

  async updateApplication(req: any, res: any, next: any) {
    try {
      const application = await this.prisma.application.findUnique({
        where: { id: req.params.id },
      });

      if (!application) null

      if (req.body?.removedDocs) {
        const removedDocs = Array.isArray(req.body.removedDocs)
          ? req.body.removedDocs
          : [req.body.removedDocs];

        for (const id of removedDocs) {
          const document = await this.prisma.document.findUnique({
            where: { id },
          });
          if (document) {
            deleteFile(document.path);
            await this.prisma.document.delete({ where: { id } });
          }
        }

        await this.prisma.application.update({
          where: { id: req.params.id },
          data: {
            documents: {
              disconnect: removedDocs.map((id) => ({ id })),
            },
          },
        });
      }

      const destination = await this.prisma.destination.findUnique({
        where: { id: req.body.destination },
        include: { requirements: true },
      });

      const docsIds = await Promise.all(
        Object.keys(req.files).map(async (name) => {
          const documentFile = req.files[name];
          const extension = documentFile.mimetype.split('/')[1];
          documentFile.name = `${name}-${destination.name}-${req.user.lastname}.${extension}`;

          let newDocumentPath;
          if (extension === 'png') {
            newDocumentPath = await uploadFile(
              `public/applications/${application.directory}-${req.user.firstname}${req.user.lastname}`,
              documentFile,
              'image',
            );
          } else {
            newDocumentPath = await uploadFile(
              `public/applications/${application.directory}-${req.user.firstname}${req.user.lastname}`,
              documentFile,
              'file',
            );
          }

          /* if (newDocumentPath !== 'error') {
             const typeDocument = await this.prisma.typeDocument.findUnique({
               where: { name },
             });

             const document = await this.prisma.document.create({
               data: {
                 typeId: typeDocument.id,
                 path: newDocumentPath,
               },
             });

             return document.id;
           } else {
             throw new Error('Failed to upload document');
           }*/
        }),
      );

      const updatedApplication = await this.prisma.application.update({
        where: { id: req.params.id },
        data: {
          documents: {
            // connect: docsIds.map((id) => ({ id })),
          },
        },
      });

      return updatedApplication
    } catch (ex) {
      next(ex);
    }
  }

  async getAllApplications(req: any, res: any, next: any) {
    try {
      const applications = await this.prisma.application.findMany({
        where: { validated: req.params.status },
        include: {
          traveler: true,
          destination: true,
        },
      });
      return res.status(200).send({ data: applications });
    } catch (ex) {
      next(ex);
    }
  }

  async getMyApplicationByDestination(req: any, res: any, next: any) {
    try {
      const applications = await this.prisma.application.findMany({
        where: {
          travelerId: req.user.id,
          destinationId: req.params.destination,
        },
      });
      return res.status(200).send({ data: applications });
    } catch (ex) {
      next(ex);
    }
  }

  async validateApplication(req: any, res: any, next: any) {
    try {
      const { decision } = req.body;
      let updatedApplication;

      if (decision === 'refused') {
        const application = await this.prisma.application.findUnique({
          where: { id: req.params.id },
          include: { documents: true },
        });

        for (const document of application.documents) {
          deleteFile(document.path);
          await this.prisma.document.delete({ where: { id: document.id } });
        }

        updatedApplication = await this.prisma.application.update({
          where: { id: req.params.id },
          data: {
            validated: decision,
            documents: { set: [] },
          },
        });
      } else {
        updatedApplication = await this.prisma.application.update({
          where: { id: req.params.id },
          data: { validated: decision },
        });
      }

      return res.status(202).send({ data: updatedApplication });
    } catch (ex) {
      next(ex);
    }
  }


  async getApplicationById(req: any, res: any, next: any) {
    try {
      const application = await this.prisma.application.findUnique({
        where: { id: req.params.id },
        include: {
          documents: true,
          traveler: true,
        },
      });
      return res.status(200).send({ data: application });
    } catch (ex) {
      next(ex);
    }
  }

  async removeApplication(req: any, res: any, next: any) {
    try {
      const application = await this.prisma.application.delete({
        where: { id: req.params.id },
      });
      return res.status(200).send({ data: application });
    } catch (ex) {
      next(ex);
    }
  }





}
