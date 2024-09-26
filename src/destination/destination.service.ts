import { Injectable, BadRequestException, InternalServerErrorException, HttpStatus, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma.service';
import { deleteFile, removeDir, uploadFile } from 'src/helpers/uploadFile'; // Assuming a helper class for file uploads
import { Destination, Prisma } from '@prisma/client';
import extractNumber from 'src/helpers/extractNumber';

@Injectable()
export class DestinationService {
  constructor(private readonly prisma: PrismaService) { }

  async createDestination(data: any, paths: any): Promise<Destination | null> {
    try {
      const { name, description, directory, typeDocumentsIds } = data;

      // Check if the destination exists
      const destinationExists = await this.prisma.destination.findFirst({
        where: { name },
      });

      if (destinationExists) return null

      // Create new destination
      const newDestination = await this.prisma.destination.create({
        data: {
          name,
          description,
          directory,
          pictures: paths, // You can adapt this if there are multiple files
          requirements: {
            connect: typeDocumentsIds.map((id: any) => ({ id: Number(id) })),
          },
        },
      });

      // Update type documents to link them with the new destination
      await Promise.all(
        typeDocumentsIds.map(async (docId: number) => {
          return this.prisma.typeDocument.update({
            where: { id: Number(docId) },
            data: {
              destinations: {
                connect: { id: newDestination.id },
              },
            },
          });
        })
      ).catch(err => console.log(err));

      return newDestination;
    }
    catch (err) {
      console.log('====================================');
      console.log(err.message);
      console.log('====================================');
    }
  }

  async getDestinationById(id: number): Promise<Destination | null> {
    try {
      return await this.prisma.destination.findUnique({
        where: { id },
        include: { requirements: true },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllDestinations(page: number, keywords?: string): Promise<Destination[] | null> {
    try {
      const pageSize = 9;
      const skip = (page - 1) * pageSize;

      const where: Prisma.DestinationWhereInput = {
        removed: false,
        ...(keywords && {
          OR: [
            { name: { contains: keywords, mode: 'insensitive' } },
            { description: { contains: keywords, mode: 'insensitive' } },
          ],
        }),
      };

      return await this.prisma.destination.findMany({
        where,
        skip,
        take: pageSize,
        include: { requirements: true },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateDestination(id: number, data: any, files: any): Promise<Destination | null> {
    // Step 1: Check if the destination exists
    const destination = await this.prisma.destination.findUnique({
      where: { id },
    });

    if (!destination) return null;

    // Step 2: Handle removed images
    if (data?.removedImages) {
      let removedImages = Array.isArray(data.removedImages)
        ? data.removedImages
        : [data.removedImages];

      removedImages.forEach((image) => deleteFile(image));

      await this.prisma.destination.update({
        where: { id: id },
        data: {
          pictures: {
            set: destination.pictures.filter(
              (picture) => !removedImages.includes(picture),
            ),
          },
        },
      });
    }

    // Step 3: Handle new image uploads
    let newPictures: string[] = [];
    if (files && files.length > 0) {
      const directory = destination.directory;
      let newImagesIndex = 1;

      if (destination.pictures.length > 0) {
        const lastImage = destination.pictures[destination.pictures.length - 1];
        newImagesIndex = extractNumber(lastImage) + 1;
      }

      newPictures = await Promise.all(
        files.map(async (imageFile, index) => {
          const currentIndex = newImagesIndex + index;
          imageFile.filename = `${currentIndex}.${imageFile.mimetype.split('/')[1]}`;
          const newImage = await uploadFile(
            `public/destinations/${directory}`,
            imageFile,
            'image',
          );
          if (newImage !== 'error') {
            return newImage;
          } else {
            throw new Error('Failed to upload images');
          }
        }),
      );
    }

    // Step 4: Update destination with new data and pictures
    const updatedDestination = await this.prisma.destination.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        pictures: { push: newPictures },
        requirements: {
          set: data.typeDocumentsIds?.map((docId) => ({
            id: parseInt(docId),
          })),
        },
      },
    });

    return updatedDestination || null
  }

  async removeDestination(id: number): Promise<Destination | null> {
    // Step 1: Remove the destination reference from TypeDocuments
    const typeDocuments = await this.prisma.typeDocument.findMany({
      where: {
        destinations: {
          some: { id: id },
        },
      },
    });
    if (!typeDocuments) return null

    // Step 2: Find the destination and remove associated pictures
    await Promise.all(
      typeDocuments.map(async (typeDocument) => {
        await this.prisma.typeDocument.update({
          where: { id: typeDocument.id },
          data: {
            destinations: {
              disconnect: { id: id },
            },
          },
        });
      })
    );

    const destination = await this.prisma.destination.findUnique({
      where: { id: id },
    });
    if (!destination) return null

    // Delete pictures associated with the destination
    destination.pictures.forEach((picture) => deleteFile(`./uploads/${picture}`));

    // Remove the directory
    removeDir(`./uploads/destinations/${destination.directory}`);

    // Step 3: Mark the destination as removed in the database
    const updatedDestination = await this.prisma.destination.update({
      where: { id: id },
      data: { removed: true },
    });

    // Return the updated destination
    return updatedDestination

  }
}


